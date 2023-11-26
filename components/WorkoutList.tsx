import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../firebaseconfig';
import { ref, get } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const WorkoutList = ({  }) => {

  const navigation = useNavigation();


  const fetchWorkoutKeys = async () => {
    try {
      const workoutsRef = ref(db, 'WorkoutKeys/0'); // Reference to the "Workouts" node
      const snapshot = await get(workoutsRef);

      if (snapshot.exists()) {
        const workoutKeys = Object.keys(snapshot.val());
        console.log('Workout Keys:', workoutKeys);
        return workoutKeys;
      } else {
        console.log('No workout data found.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching workout keys:', error);
      return [];
    }
  };

  const [workoutKeys, setWorkoutKeys] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const keys = await fetchWorkoutKeys();
      setWorkoutKeys(keys);
    };

    fetchData();
  }, []);

  const handleWorkoutPress = (title) => {
    navigation.navigate('Timer', { workoutTitle: title })
    console.log('Selected Workout Data:', title);
  };

  return (
    <View>
  <FlatList 
  data={workoutKeys}
  renderItem={({ item }) => 
  <TouchableOpacity onPress={() => handleWorkoutPress(item)}>
  <Text style={styles.title}>{item}</Text>
  </TouchableOpacity>
  }/>
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
});

export default WorkoutList;