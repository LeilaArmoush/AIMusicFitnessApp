import React, {useState, useEffect} from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import CircleProgressBar from "react-native-progress-circle";
import { useRoute } from "@react-navigation/native";

const IntervalTimer = () => {
    const restTime = 60;
    const intervalTime = 90;
    const [isIntervalRunning, setIsIntervalRunning] = useState(false);
    const [currentInterval, setCurrentInterval] = useState("interval");
    const [remainingTime, setRemainingTime] = useState(60);
    const [percent, setPercent] = useState(100);
    const [ intervalLength, setIntervalLength ] = useState(60);

    const [ secondSegment, setSecondSegment ] = useState(100/intervalLength);
    const route = useRoute();
    const values = route.params ?? {};
   
    
    useEffect(() => {
        if (isIntervalRunning) {
            const interval = setInterval(() => {
                setRemainingTime((prevRemainingTime) => prevRemainingTime - 1);
                setPercent((prevProgress) => prevProgress - secondSegment);

                function setValue(intervalType: string, intervalTimeLength: number)
                {
                    setCurrentInterval(intervalType);
                    setIntervalLength(intervalTimeLength);
                    setRemainingTime(intervalTimeLength);
                    setPercent(100);
                    setSecondSegment(100/intervalTimeLength);
                }
                
                if (remainingTime === 0) {
                    if (currentInterval === "interval") {
                        setValue("rest", restTime)
                    } else {
                        setValue("interval", intervalTime)
                    }
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isIntervalRunning, remainingTime, currentInterval, secondSegment, percent, intervalLength]);

    const startTimer = () => {
        setIsIntervalRunning(true);
    };

    const stopTimer = () => {
        setIsIntervalRunning(false);
    };
  

    return (
        <View style={styles.container}>
             <View>
    </View>
    <Text>Minutes: {values.minutes}</Text>
<Text>Seconds: {values.seconds}</Text>
<Text>Tempo: {values.tempo}</Text>
            <CircleProgressBar
                percent={percent}
                radius={70}
                borderWidth={20}
                color={currentInterval === "interval" ? "#64FAC3" : "#1A73E9"}
            />
            <Text>{values[1]}</Text>
            <Text style={styles.text}>
                {currentInterval}: {remainingTime} seconds remaining
            </Text>

            <View style={styles.buttons}>
                <Button title="Start" onPress={startTimer} />
                <Button title="Pause" onPress={stopTimer} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    circle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 10,
        borderColor: "black",
        overflow: "hidden",
    },
    text: {
        fontSize: 24,
        marginTop: 20,
    },
    buttons: {
        flexDirection: "row",
        marginTop: 20,
    },
});

export default IntervalTimer;
