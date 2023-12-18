import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { db } from '../firebaseconfig';
import { ref, get } from 'firebase/database';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '../assets/common-styles';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons'; 


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

const [fontsLoaded] = useFonts({
  Poppins_400Regular,
});

if (!fontsLoaded) {
  // Font not yet loaded, you can return a loading indicator or wait
  return null;
}

  return (
    <View style={styles.container}>
      <View style = {styles.titleContainer}>
      <View style={[{opacity: (runProgramMenuOpen || runTimeSelectionOpen) ? 0 : 100}]}>
      <Text style={styles.title}>{`Hi ${username || 'User'}` + '! Would you like to:'}</Text>
      <View style={commonStyles.card}>
      <LinearGradient
        colors={['rgba(157, 206, 255, 0.2)', 'rgba(146, 163, 253, 0.2)']}
        style={commonStyles.cardGradient}
        start={{ x: 0.2, y: 0.3 }}
          end={{ x: 0.1, y: 0 }}>  
      <TouchableOpacity onPress={() => navigateToWorkoutList()}>
        <View style={commonStyles.cardContainer}><Text style={commonStyles.cardText}>{'Go for a Run                                          '}<FontAwesome5 name="running" size={24} color="black" />
        </Text>
        </View>
      </TouchableOpacity>
      </LinearGradient>
      </View>
      <View style={commonStyles.card}>
      <LinearGradient
        colors={['rgba(157, 206, 255, 0.2)', 'rgba(146, 163, 253, 0.2)']}
        style={commonStyles.cardGradient}
        start={{ x: 0.2, y: 0.3 }}
          end={{ x: 0.1, y: 0 }}>    
      <TouchableOpacity onPress={() => navigateToWorkoutList()}>
        <View style={commonStyles.cardContainer}><Text style={commonStyles.cardText}>{'Start a run program                          '}</Text>
        <Text style={commonStyles.cardText}></Text>
        <FontAwesome name="calendar" size={24} color="black" />
        </View>
      </TouchableOpacity>
      </LinearGradient>
      </View>
      <View style={commonStyles.card}>
      <LinearGradient
        colors={['rgba(157, 206, 255, 0.2)', 'rgba(146, 163, 253, 0.2)']}
        style={commonStyles.cardGradient}
        start={{ x: 0.2, y: 0.3 }}
          end={{ x: 0.1, y: 0 }}>    
      <TouchableOpacity onPress={() => navigateToWorkoutList()}>
        <View style={commonStyles.cardContainer}>
          <Text style={commonStyles.cardText}>{'Custom Workout\n(Coming soon)                                    '}</Text>
          <FontAwesome name="edit" size={24} color="black" />
        </View>
      </TouchableOpacity>
      </LinearGradient>
      </View>
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
    </View>
  </View>   
  );
   {/*  </View>
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
    
</View> 
    </View>
      <View style={styles.fullbodyCard}>
  <View style={styles.bg}>
    <View style={styles.rectangle5718}></View>
    <Text style={styles.workoutText}>Fullbody Workout</Text>
    <Text style={styles.exercisesText}>11 Exercises | 32mins</Text>
    <View style={styles.ellipse}></View>
    <View style={styles.buttonViewmore}>
      <View style={styles.buttonBg}></View>
      <Text style={styles.buttonText}>View more</Text>
    </View>
  </View>
  <View style={styles.vector}></View>
  {/* ... (continue with other vectors and styles) */}

    

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
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Poppins_400Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.005,
    color: '#1D1617',
    marginTop: 100,
    marginBottom: 30,
    marginLeft: 30,
  },
  numericInputs: {
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Center items vertically
    justifyContent: 'center', // Center items horizontally
    //marginTop: 750, // Adjust this value as needed
   marginBottom: 900
  },
});

export default Welcome;