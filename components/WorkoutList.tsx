import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../firebaseconfig';
import { ref, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from "@react-navigation/native";
import { auth } from "../firebaseconfig";

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

  return (
    <View>
 <FlatList 
  data={workoutKeys}
  renderItem={({ item }) => {
    const isCompleted = completedWorkouts.includes(item);

    return (
      <TouchableOpacity onPress={() => handleWorkoutPress(item)}>
        <Text style={[styles.title, isCompleted ? styles.completed : null]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  }}
/>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  completed: {
    textDecorationLine: 'line-through',
  },
});

export default WorkoutList;