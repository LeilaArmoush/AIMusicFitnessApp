import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import CircleProgressBar from "react-native-progress-circle";
import { useRoute } from "@react-navigation/native";
import { db } from '../firebaseconfig'; // Import your Firestore database instance
import { ref, get } from 'firebase/database';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const IntervalTimer = () => {
  const route = useRoute();
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [currentInterval, setCurrentInterval] = useState("Run");
  const [remainingTime, setRemainingTime] = useState(0);
  const [percent, setPercent] = useState(100);
  const [intervalLength, setIntervalLength] = useState(0);
  const [secondSegment, setSecondSegment] = useState(0);
  const [data, setData] = useState([]); // State to store fetched data
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalCount, setIntervalCount] = useState(0);
  const [workoutComplete, isWorkoutComplete] = useState(false)
  const [workoutTitle, setWorkoutTitle] = useState(route.params?.workoutTitle);

  const navigation = useNavigation();

  useEffect(() => {

    const fetchData = async () => {
      try {
        const dataRef = ref(db, 'Workouts/' + workoutTitle +'/');
        const snapshot = await get(dataRef);
        console.log('database:' + workoutTitle)

        if (snapshot.exists()) {
          const dataArray = Object.values(snapshot.val());
          setIntervalCount(dataArray.length)
          setData(dataArray);
          setCurrentIndex(0);
          setRemainingTime(dataArray[0].Seconds || 0);
          setPercent(100);
          setIntervalLength(dataArray[0].Seconds || 0);
          setSecondSegment(100 / (dataArray[0].Seconds || 1)); // Prevent division by zero
        } else {
          console.log('No data found.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (workoutTitle) {
      fetchData();
    }
  }, [workoutTitle]);

  useEffect(() => {
    if (isIntervalRunning) {
      const interval = setInterval(() => {
        setRemainingTime((prevRemainingTime) => prevRemainingTime - 1);
        setPercent((prevProgress) => prevProgress - secondSegment);

        if (remainingTime === 0) {
          const nextIndex = currentIndex + 1;

          if (nextIndex < data.length) {
            const nextItem = data[nextIndex];
            setCurrentIndex(nextIndex);
            setCurrentInterval(nextItem.Rep ? "Run" : "Walk");
            setRemainingTime(nextItem.Seconds || 0);
            setPercent(100);
            setIntervalLength(nextItem.Seconds || 0);
            setSecondSegment(100 / (nextItem.Seconds || 1)); // Prevent division by zero
          } else {
            setIsIntervalRunning(false); // Stop the timer if no more items
            isWorkoutComplete(true)
            setIntervalCount(data.length)
            setData([]);
            setRemainingTime(0);
            setPercent(100);
            setIntervalLength(0);
            setSecondSegment(1); // Prevent division by zero

          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isIntervalRunning, remainingTime, secondSegment, currentIndex, data]);

  const startTimer = async () => {
    setIsIntervalRunning(true);
  };

  const stopTimer = async () => {
    setIsIntervalRunning(false);
  };

  const clearWorkout = async () => {
    // You can add logic to clear the workout data from your storage or database
    // For example, if using AsyncStorage, you can use the following:
    try {
      await AsyncStorage.removeItem(workoutTitle); // Change 'yourWorkoutDataKey' to your actual storage key
      setWorkoutTitle('');
      console.log('Workout data cleared.');
      // You may also want to reset state variables here
    } catch (error) {
      console.error('Error clearing workout data:', error);
    }
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };
  {
  return (
    <View style={styles.container}>
      <Text>{ workoutTitle }</Text>
      <Text>{currentInterval + ':'} { currentIndex + 1} {'/' + intervalCount }</Text>
      <CircleProgressBar
        percent={percent}
        radius={70}
        borderWidth={20}
        color={currentInterval === "Run" ? "#64FAC3" : "#1A73E9"}
      />
      <Text style={styles.text}>
        {currentInterval}: {formatTime(remainingTime)} remaining
      </Text>
      <View style={[styles.buttons, {opacity: workoutComplete ? 0 : 100}]}>
        <Button title="Start" onPress={startTimer}/>
        <Button title="Pause" onPress={stopTimer} />
        <Button title="Clear Workout" onPress={clearWorkout} />
      </View>
      <View style={[{opacity: workoutComplete ? 100 : 0}]}>
      <Text>{"CONGRATULATIONS YOU HAVE COMPLETED THE WORKOUT"}</Text>
      <Button title="Clear Workout" onPress={clearWorkout} />
    </View>
    </View>
  );
};
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,

    marginTop: 20,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20,
  },
});

export default IntervalTimer;
//TODO:: Update to make timer run in the background
//TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  // Implement your background task logic here
  // For example, you can update a timestamp in AsyncStorage to keep the app alive
 // return BackgroundFetch.Result.NewData;
//});
