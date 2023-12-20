import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { initializeApp } from '@firebase/app';
import { getDatabase, ref as dbref, set } from "firebase/database";
import {  getStorage, ref as storageRef, getDownloadURL} from '@firebase/storage';
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

    const audioRef = storageRef(storage, 'audio/' + audioFileName);
    const audioUrl = await getDownloadURL(audioRef);
    
    // Create a sound object
    soundObject = new Audio.Sound();
    
    // Load and play the audio
    await soundObject.loadAsync({ uri: audioUrl });
    await soundObject.playAsync();
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

export const stopAudio = async () => {
  try {
    // Check if soundObject is defined before unloading
    if (soundObject) {
      await soundObject.stopAsync();
     await soundObject.unloadAsync();
     // soundObject.setOnPlaybackStatusUpdate(null); // Reset playback status update
    }
  } catch (error) {
    console.error('Error stopping audio:', error);
  }
};

export const getImageFile = async (imageFileName) => {
  try{

    const imageRef =  storageref(storage, imageFileName);
    // Get the download URL for the audio file
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  }
  catch (error)
  {
    console.error('Error Loading Image', error);
  }
}

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

export const handleSignIn = async (email, password) => {
  try {
    // Sign in the user with the provided email and password
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSvgDownloadUrl = async (path) => {
  try {
    const reference = storage().ref(path); // Replace 'path' with the path to your SVG file
    const url = await reference.getDownloadURL();
    return url;
  } catch (error) {
    console.error('Error getting SVG download URL:', error);
  }
};