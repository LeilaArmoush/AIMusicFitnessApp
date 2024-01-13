import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity, Modal, Animated } from "react-native";
import CircleProgressBar from "react-native-progress-circle";
import { useRoute } from "@react-navigation/native";
import { auth, db, getRandomFileNameByBPM, playAudio, stopAudio, pauseAudio, playCountdownTimer, playWorkoutCompleteSound } from '../firebaseconfig';
import { ref, get, set } from 'firebase/database';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '../assets/common-styles';
import { AntDesign, Ionicons, FontAwesome } from '@expo/vector-icons'; 
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as Speech from 'expo-speech';
import { SvgXml } from 'react-native-svg';
import { badge } from "../assets/badge";
import { reload } from "@firebase/auth";

const IntervalTimer = () => {
  const route = useRoute();
  const [timerState, setTimerState] = useState("idle"); // "idle", "running", "paused"
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [currentInterval, setCurrentInterval] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [percent, setPercent] = useState(100);
  const [intervalLength, setIntervalLength] = useState(0);
  const [secondSegment, setSecondSegment] = useState(0);
  const [data, setData] = useState([]); // State to store fetched data
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);
  const [intervalsRemaining, setIntervalsRemaining] = useState(0);
  const [totalIntervalCount, setTotalIntervalCount] = useState(0);
  const [workoutComplete, isWorkoutComplete] = useState(false)
  const [workoutTitle, setWorkoutTitle] = useState(route.params?.workoutTitle);
  const[workoutType, setWorkoutType] = useState(route.params?.workoutTitle.split(':-')[0]);//['Couch-To-5k', 'elliptical'
  const [locationStarted, setLocationStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [pace, setPace] = useState(0);
  const [musicFilename, setMusicFilename] = useState("");
  const [audioOn, isAudioOn] = useState(false);
  const [narration, setNarrationText] = useState("");
  const [bpm, setBpm] = useState("");
  const [anonymous, isAnonymous] = useState(true);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(0);
  const [workoutTypeLabels, setWorkoutTypeLabels] = useState({});
  const [effortIntervalText, setEffortIntervalText] = useState("");  
  const [firstIntervalText, setFirstIntervalText] = useState("");
  const [LastIntervalText, setLastIntervalText] = useState("");
  const [RecoveryIntervalText, setRecoveryIntervalText] = useState("");


  const navigation = useNavigation();

  const LOCATION_TRACKING = 'location-tracking';

  const [fontsLoaded] = useFonts({
    Poppins_700Bold
  });
  

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
          isAnonymous(auth.currentUser?.isAnonymous);
          setSectionCount(dataArray.length)
          setData(dataArray);
          setCurrentIndex(0);
          
          setRemainingTime(dataArray[0].Seconds || 0);
          setPercent(100);
          setIntervalLength(dataArray[0].Seconds || 0);
          setSecondSegment(100 / (dataArray[0].Seconds || 1)); // Prevent division by zero
          let firstText = dataArray[0].Text.First
          setNarrationText(firstText);
          setBpm(dataArray[0].Bpm);

          const totalIntervals = dataArray.filter((item) => item.Rep === true).length;
          setTotalIntervalCount(totalIntervals);
          const workoutType = workoutTitle.split(':-')[0]
          const totalTimeInSeconds = dataArray.reduce((total, item) => total + item.Seconds, 0);
          setTotalTimeRemaining(totalTimeInSeconds);
          setIntervalsRemaining(totalIntervals);
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

    const fetchWorkoutTypeData = async () => {
      AsyncStorage.clear()
      try {
        const dataRef = ref(db, 'WorkoutTypes/' + workoutType +'/');
        const snapshot = await get(dataRef);
     //   console.log('database workouttype:' + workoutType)

        if (snapshot.exists()) {
          const workoutTypeObject = Object.values(snapshot.val());
          
          setWorkoutTypeLabels(workoutTypeObject);
          setEffortIntervalText(workoutTypeObject[0].toString());
          setFirstIntervalText(workoutTypeObject[1].toString());
          setLastIntervalText(workoutTypeObject[2].toString());
          setRecoveryIntervalText(workoutTypeObject[3].toString());

       //   console.log("Workout Object type:" + workoutTypeObject)

          } else {
          console.log('No data found.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    if (workoutTypeLabels) {
       fetchWorkoutTypeData();
    }
  }, [workoutTypeLabels]);

 /* const workoutTypeObject = {
    "Couch-To-5k": {
      FirstIntervalText: "Warm Up Walk",
      EffortIntervalText: "Run",
      RecoveryIntervalText: "Walk",
      LastIntervalText: "Cool Down Walk",
    },
    "elliptical": {
      FirstIntervalText: "Warm Up",
      EffortIntervalText: "Work Hard!",
      RecoveryIntervalText: "Recover",
      LastIntervalText: "Cool Down",
    },
  } */

  let newIntervalCount = 0;

  useEffect(() => {
    if (isIntervalRunning) {
      const interval = setInterval(async () => {
   
        setTotalTimeRemaining((prevTotalTimeRemaining) => prevTotalTimeRemaining - 1);

        setRemainingTime((prevRemainingTime) => prevRemainingTime - 1);
        setPercent((prevProgress) => prevProgress - secondSegment);
       
        if (currentInterval===LastIntervalText&&remainingTime===1)
        {

            console.log('Workout complete should be false:' + workoutComplete + 'nextIndex:' + (currentIndex) + 'data.length:' + data.length);
            if (audioOn) {
              await stopAudio();
              if (narration !== null) {
                await Speech.stop();
              }
              isAudioOn(false);
            }
        
            setIsIntervalRunning(false);
            isWorkoutComplete(true);
           // setIntervalCount(data.length);
            setData([]);
            setRemainingTime(0);
            setTotalTimeRemaining(0);
            setPercent(100);
            setIntervalLength(0);
            setSecondSegment(1); // Prevent division by zero
            setTimerState('idle');
            playWorkoutCompleteSound();
            if(isWorkoutComplete){
              if(anonymous?anonymous:auth.currentUser === null) {
                 Speech.speak("Sign up to save your future workouts, so you can track your achievements!");
              }
              else{
               Speech.speak("Congratulations! You have completed  '" + workoutTitle + "'!, save workout to record and track your achievements!");
              }
            }
        }

        if(currentIndex===0)
        {
        setCurrentInterval(firstIntervalText)
        }
        let firstText = data[currentIndex].Text.First;
        if(remainingTime === (Math.round(intervalLength-1)))
        {
          setNarrationText(firstText);
          Speech.speak(firstText);
        }
        if(intervalLength > 40)
        {
          let quarterText = data[currentIndex].Text.Second;
         
          let halfText = data[currentIndex].Text.Third;
      
          let threeQuarterText = data[currentIndex].Text.Fourth;
        
          if (remainingTime === (Math.round(intervalLength *(3/4)))) {
            setNarrationText(quarterText);
            Speech.speak(quarterText);
          }
        if (remainingTime === (Math.round(intervalLength / 2))) {
          setNarrationText(halfText);
          Speech.speak(halfText);
        }
        if (remainingTime === (Math.round(intervalLength /4))) {
          setNarrationText(threeQuarterText);
          Speech.speak(threeQuarterText);
        }
      }
       if(intervalLength>180)
       {
        if(intervalLength-remainingTime===180) {
        if (audioOn) {
          await stopAudio();
          if (narration !== null) {
            await Speech.stop();
          }
          isAudioOn(false);
        }
        const bpmFilename = await getRandomFileNameByBPM(data[currentIndex].Bpm);
        await playAudio(bpmFilename)
        isAudioOn(true);
       }
      }

        if (remainingTime === 10 && intervalLength > 20) {
          Speech.speak("10 seconds remaining!");
        }

        if(remainingTime === 4) {      
          await playCountdownTimer()
        } 
       
        if (remainingTime === 1) {
          const nextIndex = currentIndex + 1;

          let currentIntervalLabel = "";
  
          if (nextIndex + 1 === data.length) {
            currentIntervalLabel =LastIntervalText
         } else {
           currentIntervalLabel = data[nextIndex].Rep
             ? effortIntervalText
             : RecoveryIntervalText
         }; 
         if (workoutComplete === false) { 
         setCurrentInterval(currentIntervalLabel)

            const nextItem = data[nextIndex];     
            
              console.log('Workout complete should be false:' + workoutComplete + 'currentIndex+1:' + (currentIndex +1) + 'data.length:' + data.length);
              if (nextIndex + 1 === data.length) {
                setIntervalsRemaining(0)
              }
              else if(currentIndex!==0&&data[currentIndex].Rep===true)
              { 
                newIntervalCount = newIntervalCount + 1;
                setIntervalsRemaining(totalIntervalCount-newIntervalCount);
              }
        
        
            if (audioOn) {
              await stopAudio();
              if (narration !== null) {
                await Speech.stop();
              }
              isAudioOn(false);
            }

            const bpmFilename = await getRandomFileNameByBPM(nextItem.Bpm);
            await playAudio(bpmFilename)
         
            setCurrentIndex(nextIndex);
            let firstText = nextItem.Text.First
            setNarrationText(firstText);
            setBpm(nextItem.Bpm);
            setRemainingTime(nextItem.Seconds || 0);
            setPercent(100);
            setIntervalLength(nextItem.Seconds || 0);
            setSecondSegment(100 / (nextItem.Seconds || 1));
           
            isAudioOn(true);
            isWorkoutComplete(false);
            
            // Use updated narration text directly
            
           // await Speech.speak(firstText);
          }  
        }
      }, 1000);
  
      return () => {
        clearInterval(interval);
      };
    }
  }, [isIntervalRunning, remainingTime, secondSegment, currentIndex, data, audioOn, musicFilename, intervalLength, narration, bpm, intervalsRemaining]);

  const startTimer = async () => {
    console.log('bpm:' + bpm)
    setIsIntervalRunning(true);
    setTimerState("running");
    startLocationTracking();

    if(!audioOn)
    {
    const audioFilename = await getRandomFileNameByBPM(bpm);

    await playAudio(audioFilename)
    isAudioOn(true);
    }
    if(narration!==null)
    {
      Speech.speak('Lets Go!');
    }
  };

  const pauseTimer = async () => {
    setIsIntervalRunning(false);
    setTimerState("paused");
    setIsIntervalRunning(false);
    setTimerState("idle");
    setLocationStarted(false);
    if(audioOn)
    {
    await pauseAudio();
    if(narration!==null) {
    await Speech.stop();
    }
    isAudioOn(false)
    }
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
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
      if(audioOn)
      {
        await stopAudio();
        if(narration!==null) {
        await Speech.stop();
        }
        isAudioOn(false);
      }
      if(anonymous){
      //  navigation.navigate("SignUp");
      }
      else
      try {
          const uid = getCurrentUserUid();
          const userProfileRef = ref(db, 'users/' + uid);
          const userProfileSnapshot = await get(userProfileRef);
          const userProfileData = userProfileSnapshot.val();
    
          // Assuming workoutTitle is a string, replace it with the actual workout title value    
          // Create a new workout object
          const newWorkout = {
            title: workoutTitle,
            distance: distance,
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
          if(audioOn)
          {
            await stopAudio();
            if(narration!==null) {
            await Speech.stop();
            }
            isAudioOn(false);
          }

            navigation.navigate("WorkoutSelection");
  
      }
       catch (error) {
        console.error('Error saving workout to user profile:', error);
      }
    };


    const endWorkout = async () => {
      if(audioOn)
      {
        await stopAudio();
        if(narration!==null) {
        await Speech.stop();
        }
        isAudioOn(false);
      }
    /*  if(auth.currentUser === null)
      {navigation.navigate("WorkoutSelection");
    } */
      if(anonymous?anonymous:auth.currentUser === null){
        navigation.navigate("WorkoutSelection");
      }
      else
      try {
          const uid = getCurrentUserUid();
          const userProfileRef = ref(db, 'users/' + uid);
          const userProfileSnapshot = await get(userProfileRef);
          const userProfileData = userProfileSnapshot.val();
    
          // Assuming workoutTitle is a string, replace it with the actual workout title value    
          // Create a new workout object
          const newWorkout = {
            title: workoutTitle + '-incomplete',
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
        }
          catch (error) {
            console.error('Error saving workout to user profile:', error);
          }
         await auth.signOut(); 
         navigation.navigate("WorkoutSelection")
      
    };
    
    

    if (!fontsLoaded) {
      // Font not yet loaded, you can return a loading indicator or wait
      return null;
    }


  const renderButtons = () => {
    switch (timerState) {
      case "idle":
        return (
          <>
           <TouchableOpacity style={commonStyles.smallButton} onPress={startTimer}>
            <LinearGradient
             colors={['#9DCEFF', '#92A3FD']}
             style={commonStyles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>  
            <Text style={commonStyles.buttonText}>{"Start"}</Text>  
            <AntDesign name="play" size={24} color="white" />
          </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={commonStyles.smallButton} onPress={endWorkout}>
            <LinearGradient
             colors={['#9DCEFF', '#92A3FD']}
             style={commonStyles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>    
            <Text style={commonStyles.buttonText}>{"Discard"}</Text>
            <Ionicons name="refresh-circle" size={24} color="white" />
          </LinearGradient>
          </TouchableOpacity>
        </>
        );
      case "running": 
        return (
          <>
       <TouchableOpacity style={commonStyles.smallButton} onPress={pauseTimer}>
            <LinearGradient
             colors={['#C58BF2', '#EEA4CE']}
             style={commonStyles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>    
            <Text style={commonStyles.buttonText}>{"Pause"}</Text>
            <FontAwesome name="pause" size={24} color="white" />
          </LinearGradient>
          </TouchableOpacity>

          </>
        );
      default:
        return null;
    }
  };
  const navigateToSignupScreen = () =>
  {
  navigation.navigate("SignUp")
  }

  return (
    <View style={styles.container}>
 <View style={styles.dataBox}>
  <View style={styles.quadrant}>
    <View style={styles.topLeft}>
      <Text style={styles.labelText}>{'Total Time remaining'}</Text>
      <Text style={styles.dataText}>{formatTime(totalTimeRemaining)}</Text>
      </View>
    <View style={[styles.bottomRight]}>
    <Text style={styles.labelText}>{'steps per minute             '}</Text>
      <Text style={styles.dataText}>{workoutType===("elliptical"||"bike")? (bpm/2) : bpm} {workoutType===("elliptical"||"bike")? "rpm": "bpm"}</Text></View>
    <View style={styles.topRight}>
    <Text style={styles.labelText}>{'Section Time remaining'}</Text>
      <Text style={styles.dataText}>{formatTime(remainingTime)}</Text></View>
    <View style={styles.bottomLeft}>
    <Text style={styles.labelText}>{'Efforts remaining'}</Text>
      <Text style={styles.dataText}>{intervalsRemaining}</Text></View>
  </View> 
</View>
     {/* <Text style={[styles.title, { textTransform: 'capitalize'}]} >{ workoutTitle }</Text>
      <Text style={styles.title}>{'Target Steps Per Minute: ' + bpm + 'bpm'}</Text>
      { (currentIntervalCount>0&&currentIntervalCount<=totalIntervalCount) ? (<>
        <Text style={styles.title}>{currentInterval + ':'} { currentIntervalCount} {'/' + totalIntervalCount }</Text>
      </> ):(<>
        <Text style={styles.title}>{currentInterval}</Text>
      </>
      ) } */}
      <CircleProgressBar
        percent={percent}
        radius={70}
        borderWidth={20}
        color={currentInterval === effortIntervalText ? "#BCC2E4" : "#EEA4CE"}
        shadowColor="#F7F8F8"
      /> 
      <Text style={styles.title}>
        {currentInterval}
      </Text>
      <View style={[styles.buttons, {opacity: workoutComplete ? 0 : 100}]}>
        {renderButtons()}
      </View>
      <View>
  {/*}    {locationStarted ? (
        <>
          {currentLocation && (
            <View style={styles.locationInfo}>
              <View style={styles.whiteCard}>
              <Text style={styles.whiteCardText}>{'Distance\n'+ distance.toFixed(2) +'km'}</Text>
              <FontAwesome5 name="ruler-horizontal" size={40} color="black" />
              </View>
              <View style={styles.whiteCard}>
              <Text style={styles.whiteCardText}>{'Average Pace\n'} {distance > 0 ? pace.toFixed(2) : 0} {'min/km'}</Text>
              <MaterialIcons name="speed" size={40} color="black" />
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.locationInfo}>
          <Text style={styles.whiteCard}>{'Start Tracking'}</Text>
        </View>
      )} */}
      { isIntervalRunning ? (<>
        <View style={styles.locationInfo}>
          <View style={styles.whiteCardLong}>
            <Text>{currentInterval + "!"}</Text>
            <Text style={{textAlign: 'center'}}> {narration}</Text>
            </View>
        </View>
        </>
      ) : <></>}

      {workoutComplete ?  (
      <Modal style={[{opacity: workoutComplete ? 100 : 0},{backgroundColor: '#D9D9D9'}]}>  
      <View style={styles.badge}>
       <SvgXml width={200} height={200} xml={ badge } /> 
       </View>
       {anonymous?anonymous:auth.currentUser === null ? (<>
       <View style = {[commonStyles.whiteCard, {height: 200}]}>
        <Text style={[commonStyles.cardText, {textAlign:'center'}, {fontSize: 20}]}>{"Sign up to save your future workouts, so you can track your achievements!" }</Text>
       </View>
      <TouchableOpacity style={[commonStyles.button, {marginLeft: 20}]} onPress={navigateToSignupScreen}>
      <LinearGradient
        colors={['#9DCEFF', '#92A3FD']}
        style={commonStyles.buttonGradient}
        start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>    
      <Text style={commonStyles.buttonText }><AntDesign name="adduser" size={24} color="white" />{"  Sign Up"}</Text>
      </LinearGradient>
      </TouchableOpacity>
       </>
       ): <>
      <Text style={styles.titleComplete}>{"Congratulations you have completed " + workoutTitle + "!" }</Text>
      <TouchableOpacity  style={styles.button} onPress={handleSaveWorkoutPress} >     
      <LinearGradient
        colors={['#C58BF2', '#EEA4CE']}
        style={commonStyles.buttonGradient}
        start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>        
      <Text style={commonStyles.buttonText}>{"Save Workout"}</Text>
      </LinearGradient>
      </TouchableOpacity>
      </>}
   {/*}   <View style={styles.locationInfo}>
            <View style={styles.whiteCard}>
              <Text style={styles.whiteCardText}>{'Distance\n'+ distance.toFixed(2) +'km'}</Text>
              <FontAwesome5 name="ruler-horizontal" size={40} color="black" />
              </View>
              <View style={styles.whiteCard}>
              <Text style={styles.whiteCardText}>{'Average Pace\n'} {distance > 0 ? pace.toFixed(2) : 0} {'min/km'}</Text>
              <MaterialIcons name="speed" size={40} color="black" />
              </View>
            </View> */}
      </Modal> ) : (<></>)}
    </View>
    </View>
  );
  }



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    marginTop: 0,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20,
  },
  dataBox: {
    flexDirection: 'row',
    marginTop: -30,
    marginBottom: 20,
    marginLeft: 20,
    alignSelf: 'center',
    width: 300,
  },
  locationInfo: {
    flexDirection: 'row',
    marginTop: -30,
    marginLeft: 20, 
    alignSelf: 'center'
  },
  
  quadrant: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    marginRight: 20,
    height: 140,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 22,
  },
  
  topLeft: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  
  topRight: {
    position: 'absolute',
    right: 10,
    top: 10,

  },
  
  bottomLeft: {
    position: 'absolute',
    left: 10,
    bottom: 2,

  },
  
  bottomRight: {
    position: 'absolute',
    right: 10,
    bottom: 2,
  },
  dataText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 30,
  },
  labelText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
  },
  title: {
    fontFamily: 'Poppins_400Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.005,
    color: '#1D1617',
  },
  titleComplete: {
    fontFamily: 'Poppins_700Bold',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.005,
    color: '#1D1617',
    textAlign:'center',
    alignContent: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
    whiteCard: { 
      textAlignVertical: 'center',
      textAlign: 'center',
      alignItems: 'center',
      fontFamily: 'Poppins_400Regular',
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      marginBottom: 0,
      marginRight: 20,
      width: 150,
      height: 140,
      padding: 18,
      borderRadius: 20,
            elevation: 4,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 22,
    },
    whiteCardLong: { 
      textAlignVertical: 'center',
      textAlign: 'center',
      alignItems: 'center',
      fontFamily: 'Poppins_400Regular',
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      marginBottom: 0,
      marginRight: 20,
      width: 300,
      height: 140,
      padding: 18,
      borderRadius: 20,
            elevation: 4,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 22,
    },
    textWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    },
    whiteCardText: {
      fontFamily: 'Poppins_400Regular',
      fontSize: 20,
      textAlignVertical: 'center',
      textAlign: 'center',
      alignItems: 'center',
    },
    button: { 
      marginTop: -65, 
      marginBottom: 80, 
      textAlign: 'center',
      width: 345,
      height: 60,
      padding: 18,
      borderRadius: 99,
      flexDirection: 'row',
      alignSelf: 'center',
      shadowColor: 'rgba(149, 173, 254, 0.3)',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 22,
    },
    badge: {
      marginTop: 90,
      alignItems: 'center',
    },  
    quadrant: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 0,
      marginRight: 20,
      width: 140, // Adjust the width as needed
      height: 140,
      padding: 18,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      elevation: 4,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 22,
    },

    quadrantText: {
      fontFamily: 'Poppins_400Regular',
      textAlign: 'center',
    },
   
});

export default IntervalTimer;
//TODO:: Update to make timer run in the background
//TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  // Implement your background task logic here
  // For example, you can update a timestamp in AsyncStorage to keep the app alive
 // return BackgroundFetch.Result.NewData;
//});