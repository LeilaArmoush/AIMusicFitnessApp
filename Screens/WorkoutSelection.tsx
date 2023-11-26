import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import WorkoutList from '../components/WorkoutList';

export default function WorkoutSelection(){
  return (
    <View>
      <WorkoutList/>
    </View>
  );
  }
