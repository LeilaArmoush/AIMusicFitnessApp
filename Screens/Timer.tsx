import IntervalTimer from "./../components/IntervalTimer";
import { View } from 'react-native';

export const userWorkoutTitle = (route) => {
try{
if(userWorkoutTitle!==null){
 const userWorkoutTitle = route.params?.userWorkoutTitle;
}
} catch (error) {
  console.error('Error Fetching Workout Title:', error);
}
}

export default function Timer() {

  return (
      <View style={{ flex: 1 }}>
          <IntervalTimer/>
      </View>
  );
}
