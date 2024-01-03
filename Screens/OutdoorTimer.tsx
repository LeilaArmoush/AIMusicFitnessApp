import { resume } from 'expo-speech';
import { set } from 'firebase/database';
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';

const OutdoorTimer = () => {
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setTimerRunning] = useState(false);
  const [now, setNow] = useState(new Date().getTime());

  useEffect(() => {
    let timerInterval;

    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = now - startTime;
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      clearInterval(timerInterval);
    } ([isTimerRunning, startTime,elapsedTime])

    return () => clearInterval(timerInterval);
  }, [isTimerRunning, startTime]);

  const handleStartPress = () => {
    if (isTimerRunning) {
      // Pause the timer
      setTimerRunning(false);
    } else {
      // Start or resume the timer
      const now = new Date().getTime();
      const start = startTime || now;
      setStartTime(start);
      setTimerRunning(true);
    }
  };

  const handlePausePress = () => {
   
    if(isTimerRunning){            
      setTimerRunning(false);
      const pauseNow = new Date().getTime();
      setNow(pauseNow);       
    }
    else{
        setTimerRunning(true);
        setElapsedTime(now-startTime); 
    }
}

  const handleResetPress = () => {
    // Reset the timer

    setStartTime(null);
    setElapsedTime(0);
    setTimerRunning(false);
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View>
      <Text>{`Elapsed Time: ${formatTime(elapsedTime)}`}</Text>
      <Button title={'Start'} onPress={handleStartPress} />
      <Button title={isTimerRunning ? 'Pause': 'Resume'} onPress={handlePausePress}/>
      <Button title="Reset" onPress={handleResetPress} />
    </View>
  );
};

export default OutdoorTimer;
