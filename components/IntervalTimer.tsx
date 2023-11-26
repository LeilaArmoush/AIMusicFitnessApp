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

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

const IntervalTimer = () => {
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [currentInterval, setCurrentInterval] = useState("Run");
  const [remainingTime, setRemainingTime] = useState(0);
  const [percent, setPercent] = useState(100);
  const [intervalLength, setIntervalLength] = useState(0);
  const [secondSegment, setSecondSegment] = useState(0);
  const [data, setData] = useState([]); // State to store fetched data
  const [currentIndex, setCurrentIndex] = useState(0);
  const [intervalCount, setIntervalCount] = useState(0);

  const route = useRoute();
  const navigation = useNavigation();

  const workoutTitle = route.params?.workoutTitle;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataRef = ref(db, 'Workouts/' + workoutTitle +'/');
        const snapshot = await get(dataRef);

        if (snapshot.exists()) {
          const dataArray = Object.values(snapshot.val());
          setIntervalCount(dataArray.length -1)
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

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once on mount

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
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

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
      <View style={styles.buttons}>
        <Button title="Start" onPress={startTimer} />
        <Button title="Pause" onPress={stopTimer} />
      </View>
    </View>
  );
};

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
