import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../firebaseconfig';
import { ref, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from "@react-navigation/native";
import { auth } from "../firebaseconfig";
import { commonStyles } from '../assets/common-styles';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons'; 
import AppLoading from 'expo-app-loading';



const WorkoutList = ({  }) => {

  const navigation = useNavigation();
  const route = useRoute();

  const [workoutTitle, setWorkoutTitle] = useState(route.params?.workoutTitle);
  const [workoutType, setWorkoutType] = useState(route.params?.workoutType);
  const [workoutList, setWorkoutList] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [newCompletedWorkout, setNewCompletedWorkout] = useState(route.params?.userProfileData);
 

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

  const fetchWorkoutList = async () => {
    const workoutKeysArray = await fetchKeysFromDb('WorkoutKeys/0');
    const workoutKeysSubList = [];
    workoutKeysArray.forEach(element => {
        const workoutTypeValue = element.split(':-')[0];
        const subtitle = element.split(':-')[1];
       if(workoutTypeValue===workoutType){
        workoutKeysSubList.push(subtitle);
       }
      });
      console.log('workoutKeysArray:'+ workoutKeysSubList)
      return workoutKeysSubList;
  };


  useEffect(() => {
  const fetchCompletedWorkouts = async () => {
    console.log('auth.currentUser.uid:' + auth.currentUser.uid)
    const length = (await fetchKeysFromDb('users/' + auth.currentUser.uid + '/workouts')).length
    const dataArray = []
    if(newCompletedWorkout!==undefined)
    {
    dataArray.push(newCompletedWorkout)
    }
    
    for(let i=0;i<length;i++)
    {
     dataArray.push((await fetchValuesFromDb('users/' + auth.currentUser.uid + '/workouts/' + i +'/title')).toString());
    }
    setCompletedWorkouts(dataArray);
    console.log("dataArray:" + completedWorkouts )
  };
  fetchCompletedWorkouts();
}, []);


  useEffect(() => {
    const fetchData = async () => {
      const workoutListData = await fetchWorkoutList();
      setWorkoutList(workoutListData);
    };
    
    fetchData();
  }, []);

  const handleWorkoutPress = (title) => {
    setWorkoutTitle(title);
    navigation.navigate('Timer', { workoutTitle: title})
    console.log('Selected Workout Data:', title);
  };

  
const [fontsLoaded] = useFonts({
  Poppins_400Regular,
});

if (!fontsLoaded) {
  return null;
}


if (!fontsLoaded) {
  return <AppLoading />;
} else {
  return (
    <View style = {styles.container}>
      <Text style={styles.title}>{workoutType + ':'}</Text>
 <FlatList 
  data={workoutList}
  renderItem={({ item }) => {
    const workoutTitle = workoutType + ':-' + item;
    const isCompleted = completedWorkouts.includes(workoutTitle);
    const isNotCompleted = completedWorkouts.includes(workoutTitle + '-incomplete');
    return (
          <TouchableOpacity onPress={() => handleWorkoutPress(workoutTitle)}>
             <View style={commonStyles.whiteCard}> 
             <View>
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
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    marginLeft: 10,
    marginBottom: 10,
    color: '#000000',
    fontFamily: 'Poppins_400Regular',
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
   // marginBottom: -10,
    color: '#000000',
    fontFamily: 'Poppins_400Regular',
  },
  cardIcon: {
    alignSelf: 'flex-end',
    marginBottom: 4
  },
});

export default WorkoutList;