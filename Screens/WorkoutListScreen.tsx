import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const WorkoutListScreen = ({ route }) => {
 // const navigation = useNavigation();
  const { savedWorkouts } = route.params; // Assuming you have a list of saved workouts

  const handleWorkoutPress = (workoutData) => {
  //  navigation.navigate('WorkoutDetails', { workoutData });
  };

  return (
    <View>
      <Text>List of Saved Workouts</Text>
      <FlatList
        data={savedWorkouts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleWorkoutPress(item)}>
            <Text>{/* Display workout information here */}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default WorkoutListScreen;