import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import CircleProgressBar from "react-native-progress-circle";
import { useRoute } from "@react-navigation/native";
import { db } from '../firebaseconfig'; // Import your Firestore database instance
import { ref, get } from 'firebase/database';


const IntervalTimer = () => {
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [currentInterval, setCurrentInterval] = useState("interval");
  const [remainingTime, setRemainingTime] = useState(0);
  const [percent, setPercent] = useState(100);
  const [intervalLength, setIntervalLength] = useState(0);
  const [secondSegment, setSecondSegment] = useState(0);
  const [data, setData] = useState([]); // State to store fetched data
  const [currentIndex, setCurrentIndex] = useState(0);

  const route = useRoute();
  const values = route.params ?? {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataRef = ref(db, 'Week1');
        const snapshot = await get(dataRef);

        if (snapshot.exists()) {
          const dataArray = Object.values(snapshot.val());
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
            setCurrentInterval(nextItem.Rep ? "interval" : "rest");
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

  const startTimer = () => {
    setIsIntervalRunning(true);
  };

  const stopTimer = () => {
    setIsIntervalRunning(false);
  };

  return (
    <View style={styles.container}>
      <View></View>
      <Text>Seconds: {remainingTime !== undefined ? remainingTime : 'N/A'}</Text>
      <CircleProgressBar
        percent={percent}
        radius={70}
        borderWidth={20}
        color={currentInterval === "interval" ? "#64FAC3" : "#1A73E9"}
      />
      <Text>{values[1]}</Text>
      <Text style={styles.text}>
        {currentInterval}: {remainingTime} seconds remaining
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
