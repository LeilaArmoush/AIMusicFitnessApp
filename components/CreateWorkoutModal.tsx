import React, { useState } from 'react';
import { View, TextInput, Button, Modal, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CreateWorkoutModal = ({ visible, onAddWorkout, onCancel }) => {
  const [workoutName, setWorkoutName] = useState('');

  const navigation = useNavigation();

  const handleAddWorkout = () => {
    onAddWorkout(workoutName);
    setWorkoutName('');
    navigation.navigate('WorkoutListScreen');
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <TextInput
          placeholder="Enter workout name"
          onChangeText={setWorkoutName}
          value={workoutName}
          style={styles.input}
        />
        <Button title="Add Workout" onPress={handleAddWorkout} />
        <Button title="Cancel" onPress={onCancel} />
      </View>
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