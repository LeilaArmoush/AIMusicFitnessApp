import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';
import { initializeApp } from '@firebase/app';
import { getDatabase } from "firebase/database";
import { ref, set } from 'firebase/database';


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

export { db, app}

export const auth = getAuth();

export const handleSignUp = async (email, password) => {
  try {
    // Create a new user with the provided email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Access the newly created user
    const user = userCredential.user;

    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      // Add additional data
      customField: 'some test value',
    }; 


   // ref(db, 'users/'+ user.uid).set(userProfile); 

   // console.log('User signed up:', user.email);

    const userData = ref(db, 'users/'+ user.uid)  // Reference to the "Workouts" node
    const snapshot = await set(userData, userProfile);

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const handleSignIn = async (email, password) => {
  try {
    // Sign in the user with the provided email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Access the signed-in user information
    const user = userCredential.user;

    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      // Add additional data
      customField: 'some test value',
    };

    const userData = ref(db, 'users/'+ user.uid)  // Reference to the "Workouts" node
    const snapshot = await set(userData, userProfile);

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};