import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { db } from '../firebaseconfig';
import { ref, get } from 'firebase/database';
import NumericInput from 'react-native-numeric-input';


const Welcome = ({route }) => {

const navigation = useNavigation();

const [runProgramMenuOpen, isRunProgramMenuOpen] = useState(false);
const [runProgramSubMenuList, setRunProgramSubMenuList] =useState([]);
const [runTimeSelectionOpen, isRunTimeSelectionOpen ] =useState(false);
const [dataArray, setDataArray] = useState([]); // Initialize with your data
const [minutes, setMinutes] = useState();
const [seconds, setSeconds] = useState();

  const userProfile = route.params?.userProfile;

  const username = userProfile?.email.match(/^[^@]+/)[0];
  
  const handleMinutesChange = (value) => {
    setMinutes(value);
  };
  
  const handleSecondsChange = (value) => {
    setSeconds(value);
  };
  

  const navigateToWorkoutList = () => {
    navigation.navigate("WorkoutSelection")
  }
  const handleRunProgramMenuPress = () => {
    isRunProgramMenuOpen(true)
  }

  const handleRunTimeMenuPress = () => {
    isRunTimeSelectionOpen(true)
  }

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

  useEffect(() => {
    const fetchData = async () => {
      const keys = await fetchWorkoutKeys();
      const runProgramSubArray = [];
      
      // Use a Set to store unique values
      const uniqueValues = new Set();
  
      keys.forEach(element => {
        if (element.includes(':-')) {
          const value = element.split(':-')[0];
          
          // Check if the value is not already in the Set before adding it
          if (!uniqueValues.has(value)) {
            runProgramSubArray.push(value);
            uniqueValues.add(value);
          }
        }
      });
  
      setRunProgramSubMenuList(runProgramSubArray);
    };
  
    fetchData();
  }, []);

  
const handleRowChange = (id, key, value) => {
  // Find the index of the item in the array
  const itemIndex = dataArray.findIndex(item => item.id === id);

  // Create a copy of the array to avoid mutating state directly
  const newArray = [...dataArray];

  // Update the specific value in the item
  newArray[itemIndex][key] = value;

  // Update the state with the new array
  setDataArray(newArray);
};

  return (
    <View style={styles.container}>
      <View style = {styles.titleContainer}>
      <View style={[{opacity: (runProgramMenuOpen || runTimeSelectionOpen) ? 0 : 100}]}>
      <Text style={styles.title}>{`Hi, ${username || 'User'}`}</Text>
      <Text style={styles.title}>{'Would you like to:'}</Text>
      <TouchableOpacity onPress={() => navigateToWorkoutList()}><Text style={styles.title}>{'Just Run'}</Text></TouchableOpacity>
      <TouchableOpacity onPress={(handleRunProgramMenuPress)}><Text style={styles.title}>{'Start a Run program'}</Text></TouchableOpacity>
      <TouchableOpacity><Text style={styles.title}>{'Build a custom workout'}</Text></TouchableOpacity>
      </View>
      </View>
      <View style={[{opacity: runProgramMenuOpen ? 100 : 0}]}>
      <FlatList 
         data={runProgramSubMenuList}
        renderItem={({ item }) => 
        <TouchableOpacity onPress={() => navigateToWorkoutList()}>
        <Text style={styles.title}>{item}</Text>
  </TouchableOpacity>
  }/>
   {/*}   </View>
      <View style={[{opacity: runTimeSelectionOpen ? 100 : 0}]}>
      <TouchableOpacity onPress={() => handleOnPress()}>
          <Text style={styles.title}>{'Start Workout'}</Text>
          </TouchableOpacity> 
      <View style={styles.numericInputs}>
        <NumericInput
          type="up-down"
          value={minutes}
          onChange={handleMinutesChange}
          style={styles.input}
        />
        <NumericInput
          type="up-down"
          value={seconds}
          onChange={handleSecondsChange}
          style={styles.input}
        />     
          
      </View>
     
      <View>
    
</View> */}
    </View>
    
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center items horizontally
    padding: 16,
    marginTop: 300,
  },
  titleContainer: {
   // marginTop: 750,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  numericInputs: {
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Center items vertically
    justifyContent: 'center', // Center items horizontally
    //marginTop: 750, // Adjust this value as needed
   marginBottom: 900
  },
  input: {
    flex: 1, // Allow the numeric inputs to take equal space
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally
    borderColor: 'gray',
    borderWidth: 1, // Add border for better visibility
    marginHorizontal: 10, // Adjust this value as needed
    paddingHorizontal: 10, // Adjust this value as needed
  },
  buttons: {
    flex: 1, // Arrange items in a row
    alignItems: 'center', // Center items vertically
    justifyContent: 'center', // Center items horizontally
 //   marginTop: 10, // Adjust this value as needed
  // marginBottom: 500
  },
});

export default Welcome;