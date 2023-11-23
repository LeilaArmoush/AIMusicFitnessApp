import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from '../firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';

const WorkoutList = () => {
  const [titles, setTitles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "CouchTo5k"));
       const docTitles = querySnapshot.docs.map((doc) => doc.data().title);
        setTitles(docTitles);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={titles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.title}>{item}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default WorkoutList;