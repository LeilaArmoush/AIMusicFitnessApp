import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail} from '@firebase/auth';
import { initializeApp } from '@firebase/app';
import { getDatabase, ref as dbref, set } from "firebase/database";
import {  getStorage, ref as storageRef, getDownloadURL, listAll} from '@firebase/storage';
import { Audio } from 'expo-av';


const firebaseConfig = {
  apiKey: "AIzaSyDQgul1UxStJ3vQMGvLQ4XfE6hWyJJX2bA",
  authDomain: "aimusic-b0bd1.firebaseapp.com",
  databaseURL: "https://aimusic-b0bd1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aimusic-b0bd1",
  storageBucket: "aimusic-b0bd1.appspot.com",
  messagingSenderId: "864751255993",
  appId: "1:864751255993:web:88133fd6ce3cf9116a3668",
  measurementId: "G-7D9FQRZ5KK",
};

let firebaseInitialized = false;

export const initializeFirebase = () => {
  if (!firebaseInitialized) {
    initializeApp(firebaseConfig);
    
    firebaseInitialized = true;
  }
};

const app = initializeFirebase();

const db = getDatabase(app);

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

let soundObject;

export const playAudio = async (audioFileName) => {
  try {
    // Assuming audioFileName is an object and has a property like 'name'
    const audioRef = storageRef(storage, 'audio/' + audioFileName);
    const audioUrl = await getDownloadURL(audioRef);

    // Create a sound object
    soundObject = new Audio.Sound();
    //TODO: THIS NEEDS TO BE TRUE FOR OUTDOOR MODE!
    await Audio.setAudioModeAsync(
      {
        staysActiveInBackground: false,
      }
    );

    // Load and play the audio
    await soundObject.loadAsync({ uri: audioUrl });
    await soundObject.playAsync();
    await soundObject.setIsLoopingAsync(true);
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

export const _onPlaybackStatusUpdate = async (playbackStatus) => {
  if (soundObject) { 
  const { durationMillis } = await soundObject.getDurationAsync();
  const durationInSeconds = durationMillis / 1000;

  console.log(`Duration of ${audioFileName}: ${durationInSeconds} seconds`);
  if (playbackStatus.didJustFinish) {
    // Handle the loop logic here
  
      this.setState({ numberOfLoops: 200});
      playbackObject.replayAsync(); // Replay the audio
    } else {
      playbackObject.setIsLooping(false); // Disable looping
    }
  }
};

export const stopAudio = async () => {
  try {
    // Check if soundObject is defined before unloading
    if (soundObject) {
      await soundObject.stopAsync();
      await soundObject.setIsLoopingAsync(false);
     await soundObject.unloadAsync();
     // soundObject.setOnPlaybackStatusUpdate(null); // Reset playback status update
    }
  } catch (error) {
    console.error('Error stopping audio:', error);
  }
};

let countdownSoundObject;

export const playCountdownTimer= async () => {
  countdownSoundObject = new Audio.Sound();
  try {
    // Assuming audioFileName is an object and has a property like 'name'
    const audioRef = storageRef(storage, 'audio/countdown-sound-effect-8-bit-151797.mp3');
    const audioUrl = await getDownloadURL(audioRef);
    // Create a sound object
    await Audio.setAudioModeAsync(
      {
        staysActiveInBackground: true,
      }
    );

    // Load and play the audio
    await countdownSoundObject.loadAsync({ uri: audioUrl });
    await countdownSoundObject.playAsync();
    await countdownSoundObject.setIsLoopingAsync(false);
  } catch (error) {
    console.error('Error playing audio:', error);
  }
  setTimeout(someMethod,
    4000);
  }

  export const stopCountdownTimer = async () => {
    try {
      // Check if soundObject is defined before unloading
      if (countdownSoundObject) {
        await countdownSoundObject.stopAsync();
        await countdownSoundObject.setIsLoopingAsync(false);
       await countdownSoundObject.unloadAsync();
       // soundObject.setOnPlaybackStatusUpdate(null); // Reset playback status update
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  let workoutEndedSoundObject;
  
export const playWorkoutCompleteSound= async () => {
  workoutEndedSoundObject = new Audio.Sound();
  try {
    // Assuming audioFileName is an object and has a property like 'name'
    const audioRef = storageRef(storage, 'audio/trumpet-fanfare-success-epic-stock-media-1-00-02 (Joined by Happy Scribe).mp3');
    const audioUrl = await getDownloadURL(audioRef);
    // Create a sound object
    await Audio.setAudioModeAsync(
      {
        staysActiveInBackground: true,
      }
    );

    // Load and play the audio
    await workoutEndedSoundObject.loadAsync({ uri: audioUrl });
    await workoutEndedSoundObject.playAsync();
    await workoutEndedSoundObject.setIsLoopingAsync(false);
  } catch (error) {
    console.error('Error playing audio:', error);
  }
  setTimeout(someMethod,
    4000);
  }



  export const stopWorkoutCompleteSound = async () => {
    try {
      // Check if soundObject is defined before unloading
      if (workoutEndedSoundObject) {
        await workoutEndedSoundObject.stopAsync();
        await workoutEndedSoundObject.setIsLoopingAsync(false);
       await workoutEndedSoundObject.unloadAsync();
       // soundObject.setOnPlaybackStatusUpdate(null); // Reset playback status update
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };


export const pauseAudio = async () => {
  try {
    // Check if soundObject is defined before unloading
    if (soundObject) {
      await soundObject.pauseAsync();
      await soundObject.setIsLoopingAsync(false);
     await soundObject.unloadAsync();
     // soundObject.setOnPlaybackStatusUpdate(null); // Reset playback status update
    }
  } catch (error) {
    console.error('Error stopping audio:', error);
  }
};

export const getRandomFileNameByBPM = async (targetBPM) => {
  const audioRef = storageRef(storage, 'audio/');
  const files = await listAll(audioRef);

  const filteredFiles = files.items.filter((file) => {
    const fileName = file.name;
    const regex = new RegExp(`^${targetBPM}bpm_\\d+\\.mp3$`);
    return regex.test(fileName);
  });

  if (filteredFiles.length === 0) {
    // No matching files found
    return null;
  }

  // Select a random index from the filtered array
  const randomIndex = Math.floor(Math.random() * filteredFiles.length);

  // Return the name of the randomly selected file
  return filteredFiles[randomIndex].name;
};

export { db, app }

export const auth = getAuth(app);



export const getUserData = async (credential) => {
  try {
  
    const user = credential.user;

    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      // Add additional data
      customField: 'some test value',
    }; 

    const userData = dbref(db, 'users/'+ user.uid) 
    const snapshot = await set(userData, userProfile);

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const handleSignUp = async (email, password) => {
  try {
    // Create a new user with the provided email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return getUserData(userCredential);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const handlePasswordReset = async (email) => {
  await sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log("Password reset email sent successfully!");
    })
    .catch((error) => {
      console.error("Error sending password reset email:", error);
    });
  }
export const handleSignIn = async (email, password) => {
  try {
    // Sign in the user with the provided email and password
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSvgDownloadUrl = async (fileName) => {
  try {
    const fileRef = storageRef(storage, 'svg/' + fileName);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error getting SVG download URL:', error);
  }
};