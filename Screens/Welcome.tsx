import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { db } from '../firebaseconfig';
import { ref, get } from 'firebase/database';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { commonStyles } from '../assets/common-styles';
import { Ionicons } from '@expo/vector-icons'; 

const Welcome = ({route }) => {

const navigation = useNavigation();

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

const fetchWorkoutKeys = async () => {
  return fetchKeysFromDb('WorkoutKeys/0');
};

const [workoutKeys, setWorkoutKeys] = useState([]);
const [runProgramSubMenuList, setRunProgramSubMenuList] =useState([]);


useEffect(() => {
  const fetchData = async () => {
    const keys = await fetchWorkoutKeys();
    const runProgramArrayDuplicates = [];

    keys.forEach(element => {
      if (element.includes(':-')) {
        const value = element.split(':-')[0];
        console.log('value keys:'+ value)
        runProgramArrayDuplicates.push(value);
        }
      });
    const runProgramArray =[...new Set(runProgramArrayDuplicates)]
    setRunProgramSubMenuList(runProgramArray);
  };

  fetchData();
}, []);


const [fontsLoaded] = useFonts({
  Poppins_400Regular,
});

if (!fontsLoaded) {
  // Font not yet loaded, you can return a loading indicator or wait
  return null;
}

const handleCategoryPress = (type) => {
  navigation.navigate('WorkoutSelection', { workoutType: type})
  console.log('Selected Workout Data:', type);
};

  return (
    <View>
    <View>
    <Text style={[styles.title, {marginTop: 20}, {marginLeft:10}]}>{'Hi! Choose a workout list:'}</Text>
    <FlatList 
   data={runProgramSubMenuList}
   renderItem={({ item }) => {
     return (<>
       <View>
         <TouchableOpacity onPress={() => handleCategoryPress(item)}>
         <View style={[commonStyles.whiteCard, {height: 100},{marginTop:20}]}>
          <Text style={styles.title}>{item}</Text>
          <Ionicons name="ios-arrow-forward-circle-outline" size={24} color="grey" style={styles.cardIcon} /> 
          </View>
         </TouchableOpacity>
         </View>
         </>
     );
   }
  }
 />
    </View> 
  </View> 
  )

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center items horizontally
    padding: 16,
    marginTop: 300, 
  },
  titleContainer: {
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Poppins_400Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.005,
    color: '#000000',
   // marginTop: 100,
   // marginBottom: 30,
   // marginLeft: 30,
  },
  numericInputs: {
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Center items vertically
    justifyContent: 'center', // Center items horizontally
    //marginTop: 750, // Adjust this value as needed
   marginBottom: 900
  },
  cardIcon: {
    alignSelf: 'flex-end',
    marginBottom: 15
  },
});

export default Welcome;