import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TRACKING = 'location-tracking';

function UserLocation() {
  const [locationStarted, setLocationStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [pace, setPace] = useState(0);

  const startLocationTracking = async () => {
    setStartTime(new Date());
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 0,
    });
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );
    setLocationStarted(hasStarted);
    console.log('tracking started?', hasStarted);
  };

  useEffect(() => {
    const config = async () => {
      let resf = await Location.requestForegroundPermissionsAsync();
      let resb = await Location.requestBackgroundPermissionsAsync();
      if (resf.status !== 'granted' && resb.status !== 'granted') {
        console.log('Permission to access location was denied');
      } else {
        console.log('Permission to access location granted');
      }
    };

    config();
  }, []);

  const startLocation = () => {
    startLocationTracking();
  };

  const stopLocation = () => {
    setLocationStarted(false);
    TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING).then((tracking) => {
      if (tracking) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    });
  };

  const calculateDistance = (locations) => {
    if (!locations || locations.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const prevLocation = locations[i - 1].coords;
      const currentLocation = locations[i].coords;
      const distanceInMeters = Location.distance(
        prevLocation,
        currentLocation
      );
      totalDistance += distanceInMeters;
    }

    return totalDistance / 1000;
  };

  const calculatePace = (elapsedSeconds, distanceInKm) => {
    // Calculate pace in minutes per kilometer
    const pace = elapsedSeconds > 0 ? elapsedSeconds / distanceInKm / 60 : 0;
    return pace;
  };

  TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
      console.log('LOCATION_TRACKING task ERROR:', error);
      return;
    }
    if (data) {
      const { locations } = data;
      const latestLocation = locations[0].coords;
      setCurrentLocation(latestLocation);

      const currentTime = new Date();
      const elapsedMilliseconds = currentTime - startTime;
      const elapsedSeconds = elapsedMilliseconds / 1000;

      const newDistance = calculateDistance(locations);
   
      setDistance(newDistance);

      const newPace = calculatePace(elapsedSeconds, newDistance);

      setPace(newPace);

      console.log(
        `${new Date(Date.now()).toLocaleString()}: ${latestLocation.latitude},${latestLocation.longitude}`
      );
    }
  });

  return (
    <View>
      {locationStarted ? (
        <>
          <TouchableOpacity onPress={stopLocation}>
            <Text style={styles.btnText}>Stop Tracking</Text>
          </TouchableOpacity>
          {currentLocation && (
            <View style={styles.locationInfo}>
              <Text>Latitude: {currentLocation.latitude}</Text>
              <Text>Longitude: {currentLocation.longitude}</Text>
              <Text>Distance: {distance.toFixed(2)} km</Text>
              {/* You can format pace as needed */}
              <Text>Pace: {distance > 0 ? pace.toFixed(2) : 0} min/km</Text>
            </View>
          )}
        </>
      ) : (
        <TouchableOpacity onPress={startLocation}>
          <Text style={styles.btnText}>Start Tracking</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  btnText: {
    fontSize: 20,
    backgroundColor: 'green',
    color: 'white',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  locationInfo: {
    marginTop: 20,
  },
});

export default UserLocation;