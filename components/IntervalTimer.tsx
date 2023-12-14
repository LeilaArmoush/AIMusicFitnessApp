import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import CircleProgressBar from "react-native-progress-circle";
import { useRoute } from "@react-navigation/native";
import { db } from '../firebaseconfig'; // Import your Firestore database instance
import { ref, get, set } from 'firebase/database';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as BackgroundFetch from 'expo-background-fetch';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { auth } from './../firebaseconfig'; // Import your Firebase authentication instance

const IntervalTimer = () => {
  const route = useRoute();
  const [timerState, setTimerState] = useState("idle"); // "idle", "running", "paused"
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
  const [locationStarted, setLocationStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [pace, setPace] = useState(0);

  const navigation = useNavigation();

  const LOCATION_TRACKING = 'location-tracking';

  const startLocationTracking = async () => {
    setStartTime(new Date());
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 0,
    });
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );
    setLocationStarted(hasStarted);
    console.log('tracking started?', hasStarted);
  };

  const handleRefresh = async () => {
    try {
      // Reload the app
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading app:', error);
    }
  };

  useEffect(() => {
    const config = async () => {
      let resf = await Location.requestForegroundPermissionsAsync();
      let resb = await Location.requestBackgroundPermissionsAsync();
      if (resf.status !== 'granted' && resb.status !== 'granted') {
        console.log('Permission to access location was denied');
      } else {
        console.log('Permission to access location granted');
      }
    };

    config();
  }, []);

  const startLocation = () => {
    startLocationTracking();
  };

  const stopLocation = () => {
    setLocationStarted(false);
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
  };

  const calculateDistance = (locations) => {
    if (!locations || locations.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const prevLocation = locations[i - 1].coords;
      const currentLocation = locations[i].coords;
      const distanceInMeters = Location.distance(
        prevLocation,
        currentLocation
      );
      totalDistance += distanceInMeters;
    }

    return totalDistance / 1000;
  };

  const calculatePace = (elapsedSeconds, distanceInKm) => {
    // Calculate pace in minutes per kilometer
    const pace = elapsedSeconds > 0 ? elapsedSeconds / distanceInKm / 60 : 0;
    return pace;
  };

  TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
      console.log('LOCATION_TRACKING task ERROR:', error);
      return;
    }
    if (data) {
      const { locations } = data;
      const latestLocation = locations[0].coords;
      setCurrentLocation(latestLocation);

      const currentTime = new Date();
      const elapsedMilliseconds = currentTime - startTime;
      const elapsedSeconds = elapsedMilliseconds / 1000;

      const newDistance = calculateDistance(locations);
   
      setDistance(newDistance);

      const newPace = calculatePace(elapsedSeconds, newDistance);

      setPace(newPace);

      console.log(
        `${new Date(Date.now()).toLocaleString()}: ${latestLocation.latitude},${latestLocation.longitude}`
      );
    }
  });

  useEffect(() => {

    const fetchData = async () => {
      AsyncStorage.clear()

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
//    }
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
            setTimerState("idle");

          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isIntervalRunning, remainingTime, secondSegment, currentIndex, data]);

  const startTimer = async () => {
    setIsIntervalRunning(true);
    setTimerState("running");
    startLocationTracking();
  };

  const pauseTimer = async () => {
    setIsIntervalRunning(false);
    setTimerState("paused");
    setIsIntervalRunning(false);
    setTimerState("idle");
    setLocationStarted(false);
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
  };

  const resumeTimer = async () => {
    setIsIntervalRunning(true);
    setTimerState("running");
    startLocationTracking();
  };

  const stopTimer = async () => {
    setIsIntervalRunning(false);
    setTimerState("idle");
    setLocationStarted(false);
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
  };

  const clearWorkout = async () => {
    // You can add logic to clear the workout data from your storage or database
    // For example, if using AsyncStorage, you can use the following:
    try {
       AsyncStorage.clear(); // Change 'yourWorkoutDataKey' to your actual storage key
      // You may also want to reset state variables here
    } catch (error) {
      console.error('Error clearing data stored:', error);
    }
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const getCurrentUserUid = () => {
    // Get the current user
    const currentUser = auth.currentUser;
  
    if (currentUser) {
      // The UID of the current user
      const userUid = currentUser.uid;
      console.log('Current user UID:', userUid);
      return userUid;
      } else {
      console.log('No user is currently signed in.');
      return null;
      }
    };

    const handleSaveWorkoutPress = async () => {
      try {
        const uid = getCurrentUserUid();
    
        const userProfileRef = ref(db, 'users/' + uid);
        const userProfileSnapshot = await get(userProfileRef);
    
        if (userProfileSnapshot.exists()) {
          const userProfileData = userProfileSnapshot.val();
    
          // Assuming workoutTitle is a string, replace it with the actual workout title value    
          // Create a new workout object
          const newWorkout = {
            title: workoutTitle,
            timestamp: new Date().toISOString(), // Include a timestamp or any other relevant information
          };
    
          // Check if the workouts array exists in the user's profile
          if (!userProfileData.workouts) {
            // If it doesn't exist, create a new array and add the first workout
            userProfileData.workouts = [newWorkout];
          } else {
            // If it exists, push the new workout to the array
            userProfileData.workouts.push(newWorkout);
          }
    
          // Update the user's profile with the modified data
          await set(userProfileRef, userProfileData);
    
          console.log('Workout added to user profile successfully.');
        } else {
          console.log('User profile not found.');
        }
      } catch (error) {
        console.error('Error saving workout to user profile:', error);
      }
    };

  const renderButtons = () => {
    switch (timerState) {
      case "idle":
        return (
          <>
          <Button title="Start" onPress={startTimer} />
        <Button title="Clear Workout" onPress={clearWorkout} />
        </>
        );
      case "running":
        return (
          <>
            <Button title="Pause" onPress={pauseTimer} />
 
          </>
        );
      case "paused":
        return (
          <>
            <Button title="Resume" onPress={resumeTimer} />
            <Button title="Clear Workout" onPress={clearWorkout} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Refresh" onPress={handleRefresh} />
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
      {/* Display pace and distance */}
      <View style={[styles.buttons, {opacity: workoutComplete ? 0 : 100}]}>
        {renderButtons()}
      </View>
      <View style={[{opacity: workoutComplete ? 100 : 0}]}>
        <Text>{"CONGRATULATIONS YOU HAVE COMPLETED THE WORKOUT"}</Text>
        <Button title="Clear Workout" onPress={clearWorkout} />
        <Button title="Save Workout" onPress={handleSaveWorkoutPress} />
      </View>
      <View>
      {locationStarted ? (
        <>
          {currentLocation && (
            <View style={styles.locationInfo}>
              <Text>Latitude: {currentLocation.latitude}</Text>
              <Text>Longitude: {currentLocation.longitude}</Text>
              <Text>Distance: {distance.toFixed(2)} km</Text>
              {/* You can format pace as needed */}
              <Text>Pace: {distance > 0 ? pace.toFixed(2) : 0} min/km</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.locationInfo}>
          <Text style={styles.locationInfo}>Start Tracking</Text>
        </View>
      )}
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
  locationInfo: {
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
