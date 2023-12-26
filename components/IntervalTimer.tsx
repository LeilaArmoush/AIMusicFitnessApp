import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity, Modal } from "react-native";
import CircleProgressBar from "react-native-progress-circle";
import { useRoute } from "@react-navigation/native";
import { auth, db, getRandomFileNameByBPM, playAudio, stopAudio, pauseAudio } from '../firebaseconfig';
import { ref, get, set } from 'firebase/database';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '../assets/common-styles';
import { AntDesign, Ionicons, FontAwesome, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; 
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as Speech from 'expo-speech';
import { Svg, SvgUri } from 'react-native-svg';

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [musicFilename, setMusicFilename] = useState("");
  const [audioOn, isAudioOn] = useState(false);
  const [narration, setNarrationText] = useState("Lets Go!");
  const [bpm, setBpm] = useState("");
  const [svgURL, setSvgURL] = useState("");

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
          setIntervalCount(dataArray.length)
          setData(dataArray);
          setCurrentIndex(0);
          setRemainingTime(dataArray[0].Seconds || 0);
          setPercent(100);
          setIntervalLength(dataArray[0].Seconds || 0);
          setSecondSegment(100 / (dataArray[0].Seconds || 1)); // Prevent division by zero
          setNarrationText(dataArray[0].Text);
          setBpm(dataArray[0].Bpm);
          setCurrentInterval(dataArray[0].Rep ? 'Run' : 'Walk')
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
      const interval = setInterval(async () => {
        setRemainingTime((prevRemainingTime) => prevRemainingTime - 1);
        setPercent((prevProgress) => prevProgress - secondSegment);
  
        if (remainingTime === (intervalLength / 2) && intervalLength > 40) {
          Speech.speak("Halfway through this section! Keep it up!");
        }
  
        if (remainingTime === 10 && intervalLength > 40) {
          Speech.speak("10 seconds remaining!");
        }
  
        if (remainingTime === 0) {
          const nextIndex = currentIndex + 1;
        
          if (nextIndex < data.length) {
            const nextItem = data[nextIndex];
            const plusTwoItem = data[nextIndex + 1];
        
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
            setNarrationText(nextItem.Text);
            setCurrentInterval(nextItem.Rep ? 'Run' : 'Walk');
            setRemainingTime(nextItem.Seconds || 0);
            setPercent(100);
            setIntervalLength(nextItem.Seconds || 0);
            setSecondSegment(100 / (nextItem.Seconds || 1));
           
            isAudioOn(true);
            isWorkoutComplete(false);
            
            // Use updated narration text directly
            
            await Speech.speak(nextItem.Text);
          } else {
            if (audioOn) {
              await stopAudio();
              if (narration !== null) {
                await Speech.stop();
              }
              isAudioOn(false);
            }
        
            setIsIntervalRunning(false);
            isWorkoutComplete(true);
            setIntervalCount(data.length);
            setData([]);
            setRemainingTime(0);
            setPercent(100);
            setIntervalLength(0);
            setSecondSegment(1); // Prevent division by zero
            setTimerState('idle');
          }
        }
      }, 1000);
  
      return () => {
        clearInterval(interval);
      };
    }
  }, [isIntervalRunning, remainingTime, secondSegment, currentIndex, data, audioOn, musicFilename, intervalLength, narration, bpm]);
  
  
/* const pathToRunTrack = storageReference('run2.mp3')
  async function playSound(pathToTrack) {
    
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      { uri: `file://${pathToTrack}` } // Use the file:// protocol for local files
    );
    setSound(sound);
  
    console.log('Playing Sound');
    await sound.playAsync();
  }  */

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
      Speech.speak(narration);
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

  const handleSignOut= async () => {
    try {
      // Sign the user out
      await auth.signOut();

      console.log('User signed out successfully.');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };
  

  const clearWorkout = async () => {
    if(audioOn)
    {
      await stopAudio();
      if(narration!==null) {
      await Speech.stop();
      }
      isAudioOn(false);
    }
       await auth.signOut(); 
       navigation.navigate("SignIn")
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
      if(auth.currentUser.isAnonymous){
        navigation.navigate("SignUp");
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
          handleSignOut();
          navigation.navigate("SignIn");
      }
       catch (error) {
        console.error('Error saving workout to user profile:', error);
      }
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
          <TouchableOpacity style={commonStyles.smallButton} onPress={clearWorkout}>
            <LinearGradient
             colors={['#9DCEFF', '#92A3FD']}
             style={commonStyles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>    
            <Text style={commonStyles.buttonText}>{"End Workout"}</Text>
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

 /* useEffect(() => {
    const displaySVGURI = async () => {
      try {
        const imageFile =  getImageFile('runner.svg');
        setSvgURL(imageFile);
      } catch (error) {
        console.error('Error fetching SVG:', error);
      }
    };

    displaySVGURI();

    // Cleanup function (if needed)
    return () => {
      // Perform any cleanup logic here
    };
  }, []); */


  return (
    <View style={styles.container}>
  {/*    <SvgUri
    width="100%"
    height="100%"
    uri= {svgURL}
  /> */}
      <Text style={styles.title}>{ workoutTitle }</Text>
      <Text style={styles.title}>{currentInterval + ':'} { currentIndex + 1} {'/' + intervalCount }</Text>
      <CircleProgressBar
        percent={percent}
        radius={70}
        borderWidth={20}
        color={currentInterval === "Run" ? "#BCC2E4" : "#EEA4CE"}
        shadowColor="#F7F8F8"
      />
      <Text style={styles.title}>
        {formatTime(remainingTime)} remaining
      </Text>
      <View style={[styles.buttons, {opacity: workoutComplete ? 0 : 100}]}>
        {renderButtons()}
      </View>
      <View>
      {locationStarted ? (
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
      )}
      {workoutComplete ? (
      <Modal style={[{opacity: workoutComplete ? 100 : 0}]}>  
      <Text style={styles.titleComplete}>{"CONGRATULATIONS YOU HAVE COMPLETED THE WORKOUT!!!"}</Text>
      <TouchableOpacity  style={styles.button} onPress={handleSaveWorkoutPress} >     
      <LinearGradient
        colors={['#C58BF2', '#EEA4CE']}
        style={commonStyles.buttonGradient}
        start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>        
      <Text style={commonStyles.buttonText}>{"Save Workout and Sign Out"}</Text>
      </LinearGradient>
      </TouchableOpacity>
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
      </Modal> ) : (<></>)}
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
    marginTop: 0,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    marginTop: -30,
    marginLeft: 20, 
    alignSelf: 'center'
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
    marginTop: 200,
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
   
});

export default IntervalTimer;
//TODO:: Update to make timer run in the background
//TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  // Implement your background task logic here
  // For example, you can update a timestamp in AsyncStorage to keep the app alive
 // return BackgroundFetch.Result.NewData;
//});
