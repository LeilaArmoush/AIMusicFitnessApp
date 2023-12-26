import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CompletedWorkoutModal = ({ visible, onAddWorkout, onCancel }) => {

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
        handleSignOut();
      } else {
        console.log('User profile not found.');
      }
    } catch (error) {
      console.error('Error saving workout to user profile:', error);
    }
  };

  const navigation = useNavigation();

  return (
    <Modal visible={visible} animationType="slide">
    <View style={[{opacity: workoutComplete ? 100 : 0}]}>  
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
      </View>
      <View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
});

export default CreateWorkoutModal;