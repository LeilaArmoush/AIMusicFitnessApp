import React, { useState } from 'react';
import { View, FlatList, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import NumericInput from 'react-native-numeric-input';
import { useNavigation } from '@react-navigation/native';
import CreateWorkoutModal from './CreateWorkoutModal';


const InputFields = () => {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCreateWorkout = async () => {
    try {
      // Create a new workout data object
      const newWorkout = {
        Bpm: bpmInput,
        Minutes: minutesInput,
        Rep: true,
        Seconds: secondsInput,
      };
  
      // Handle success or show a message to the user
      console.log('Workout added to Firestore:', newWorkout);
    } catch (error) {
      // Handle errors
      console.error('Error adding workout:', error);
    } 
    setIsModalVisible(true);
  };

 /* const handleStartWorkout = () => {
    const workoutData = rows.map((row) => ({
      minutes: row.minutes,
      seconds: row.seconds,
      tempo: row.tempo,
    }));
    // Navigate to TimerScreen with parameters
    navigation.navigate('Timer', { workoutData, });
  } */

  const [rows, setRows] = useState([
    {
      id: 1,
      selectedButton: null,
      minutes: 0,
      seconds: 0,
      tempo: 170,
    },
  ]);

  const [nextId, setNextId] = useState(2);
  const [intervalTimeInput, setIntervalTimeInput] = useState(0);
  const [restTimeInput, setRestTimeInput] = useState(0);

  const handleSwitch = (rowId, selectedButton) => {
    setRows((prevRows) => {
      // Update the selected button for the current row
      const updatedRows = prevRows.map((row) =>
        row.id === rowId ? { ...row, selectedButton } : row
      );

      // If "Add Rep" or "Add Rest" is selected, add a new row
      if (selectedButton === 'Add Rep' || selectedButton === 'Add Rest') {
        return [
          ...updatedRows,
          {
            id: nextId,
            selectedButton: null,
            minutes: 0,
            seconds: 0,
            tempo: 170,
          },
        ];
      }

      return updatedRows;
    });

    // Increment the nextId for the new row
    setNextId(nextId + 1);
  };

  const handleDelete = (rowId) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== rowId));
  };

  const renderRowItem = ({ item }) => {
    const rowBackgroundColor =
      item.selectedButton === 'Add Rep'
        ? 'green'
        : item.selectedButton === 'Add Rest'
        ? 'red'
        : 'white';

    return (
      <View style={[styles.item, { backgroundColor: rowBackgroundColor }]}>
        <View style={styles.input}>
          {item.selectedButton ? (
            <View style={styles.numericInputs}>
              <NumericInput
                type="up-down"
                value={item.minutes}
                onChange={(value) => handleRowChange(item.id, 'minutes', value)}
                style={styles.input}
              />
              <NumericInput
                type="up-down"
                value={item.seconds}
                onChange={(value) => handleRowChange(item.id, 'seconds', value)}
                style={styles.input}
              />
              <NumericInput
                type="up-down"
                value={item.tempo}
                onChange={(value) => handleRowChange(item.id, 'tempo', value)}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  {
                    backgroundColor:
                      item.selectedButton === 'Add Rep'
                        ? 'green'
                        : item.selectedButton === 'Add Rest'
                        ? 'red'
                        : '#ccc',
                  },
                ]}
                onPress={() => handleSwitch(item.id, 'Add Rep')}
              >
                <Text>Add Rep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  {
                    backgroundColor:
                      item.selectedButton === 'Add Rest'
                        ? 'red'
                        : item.selectedButton === 'Add Rep'
                        ? 'green'
                        : '#ccc',
                  },
                ]}
                onPress={() => handleSwitch(item.id, 'Add Rest')}
              >
                <Text>Add Rest</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

const [minutesInput, setMinutesInput] = useState(0);
const [secondsInput, setSecondsInput] = useState(0);
const [bpmInput, setBpmInput] = useState(170);

  const handleRowChange = (rowId, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );

      // Check which field was changed and update the corresponding state variable
  if (field === 'minutes') {
    setMinutesInput(value);
  } else if (field === 'seconds') {
    setSecondsInput(value);
  } else if (field === 'tempo') {
    setBpmInput(value);
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Minutes</Text>
        <Text style={styles.headerText}>Seconds</Text>
        <Text style={styles.headerText}>BPM</Text>
        <Text style={styles.headerText}>Remove</Text>
      </View>
      <FlatList
        data={rows}
        renderItem={renderRowItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <TouchableOpacity style={styles.doWorkoutButton} onPress={handleCreateWorkout}>
        <Text>Start Workout</Text>
      </TouchableOpacity>
      <CreateWorkoutModal
        visible={isModalVisible}
        onAddWorkout={(workoutName) => {
          // Handle adding the workout logic here
          // Example: console.log('Adding workout:', workoutName);

          // Close the modal
          setIsModalVisible(false);
        }}
        onCancel={() => setIsModalVisible(false)}
      />
    </View>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#ccc',
  },
  headerText: {
    fontWeight: 'bold',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20, // Add margin to separate rows
  },
  numericInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchButton: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: 'gray',
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  doWorkoutButton: {
    padding: 10,
  },
  inputField: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
});

export default InputFields;