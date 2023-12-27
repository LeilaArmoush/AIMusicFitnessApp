import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../firebaseconfig';
import { ref, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from "@react-navigation/native";
import { auth } from "../firebaseconfig";
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '../assets/common-styles';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons'; 


const WorkoutList = ({  }) => {

  const navigation = useNavigation();
  const route = useRoute();

  const [workoutTitle, setWorkoutTitle] = useState(route.params?.workoutTitle);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
 
  const fetchKeysFromDb =  async (path) => {
    try {
      const reference = ref(db, path); // Reference to the "Workouts" node
      const snapshot = await get(reference);

      if (snapshot.exists()) {
        const keys = Object.keys(snapshot.val());
        console.log('Keys:', keys);
        return keys;
      } else {
        console.log('No data found.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching keys:', error);
      return [];
    }
  };

  const fetchValuesFromDb =  async (path) => {
    try {
      const reference = ref(db, path); // Reference to the "Workouts" node
      const snapshot = await get(reference);

      if (snapshot.exists()) {
        const data = Object.values(snapshot.val());
        const stringData = data.join("")
        console.log('Values:', stringData);
        return stringData;
      } else {
        console.log('No data found.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching keys:', error);
      return [];
    }
  };

  const fetchWorkoutKeys = async () => {
    return fetchKeysFromDb('WorkoutKeys/0');
  };

  useEffect(() => {
  const fetchCompletedWorkouts = async () => {

    const length = (await fetchKeysFromDb('users/' + auth.currentUser.uid + '/workouts')).length
    const dataArray = []
    for(let i=0;i<length;i++)
    {
     dataArray.push((await fetchValuesFromDb('users/' + auth.currentUser.uid + '/workouts/' + i +'/title')).toString());
    }
    setCompletedWorkouts(dataArray);
    console.log("dataArray:" + completedWorkouts )
  };
  fetchCompletedWorkouts();
}, []);

  const [workoutKeys, setWorkoutKeys] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const keys = await fetchWorkoutKeys();

      setWorkoutKeys(keys);
    };

    fetchData();
  }, []);

  
   /* const fetchWorkoutCompletedData = async () => {
      const keys = await fetchCompletedWorkouts();
      setCompletedWorkouts(keys);
      console.log("dataArray:" + completedWorkouts )
    };

    fetchWorkoutCompletedData();
  }, []);*/

  const handleWorkoutPress = (title) => {
    setWorkoutTitle(title);
    navigation.navigate('Timer', { workoutTitle: title})
    console.log('Selected Workout Data:', title);
  };

  
const [fontsLoaded] = useFonts({
  Poppins_400Regular,
});

if (!fontsLoaded) {
  // Font not yet loaded, you can return a loading indicator or wait
  return null;
}

  return (
    <View style = {styles.container}>
 <FlatList 
  data={workoutKeys}
  renderItem={({ item }) => {
    const isCompleted = completedWorkouts.includes(item);
    const isNotCompleted = completedWorkouts.includes(item + '-incomplete');
    return (
          <TouchableOpacity onPress={() => handleWorkoutPress(item)}>
             <View style={commonStyles.whiteCard}> 
             <View >
            <SimpleLineIcons name="badge" size={24} color="#d4ad22" style = {[{opacity: isCompleted ? 100 : 0}]} />
            </View>
              <Text style={styles.cardText}>
              {item}            
            </Text>
            <Ionicons name="refresh-circle-outline" size={24} color="black" style = {[{opacity: isNotCompleted ? 100 : 0}]}/>
            <Text style={[styles.tryAgainCardText, {opacity: isNotCompleted ? 100 : 0}]}>
           
              {'  Try Again! '}           
            </Text>
                <Ionicons name="ios-arrow-forward-circle-outline" size={24} color="grey" style={styles.cardIcon} />
            </View>
          </TouchableOpacity>
        
    );
  }}
/>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  completed: {
    textDecorationLine: 'line-through',
  },
  cardText: {
    flex: 1,
    color: '#000000',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    marginRight: 10,
    marginLeft: 10,
   // lineHeight: 24,
  },
  tryAgainCardText: {
    marginLeft: 10,
    marginBottom: -10,
    color: '#000000',
    fontFamily: 'Poppins_400Regular',
  },
  cardIcon: {
    alignSelf: 'flex-end',
  },
});

export default WorkoutList;