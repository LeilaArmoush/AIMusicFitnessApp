import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from './Screens/SignIn'; // Your login screen component
import Planner from './Screens/Planner';
import Timer from './Screens/Timer';
import WorkoutSelection from "./Screens/WorkoutSelection";
import SubscriptionScreen from './Screens/SubscriptionLanding';
import { initializeFirebase, auth } from './firebaseconfig'; // Adjust the import path accordingly
import SignupScreen from './Screens/SignUp'; // Import the new SignupScreen
import WelcomeScreen from './Screens/Welcome';
import OutdoorTimer from './Screens/OutdoorTimer';
import ForgottenPassword from './Screens/ForgottenPassword';
import { MaterialIcons } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
import { stopAudio } from './firebaseconfig';
import { set } from 'firebase/database';
import Subscription from './components/Subscription';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const LogoutButton = () => {
 if(!auth.currentUser?.isAnonymous) {
  const navigation = useNavigation();

  const handleLogout = () => {
    stopAudio()
    auth.signOut()
    navigation.navigate('SignIn');
  };

return (
  <TouchableOpacity onPress={handleLogout}>
    <View style={{ marginRight: 16 }}>
      <Text style={{ color: 'white' }}><MaterialIcons name="logout" size={15} color="white" style={{marginTop: 20}} />{' Logout'}</Text>
    </View>
  </TouchableOpacity>
);
};
};
export default function Navigation() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check the user's authentication state when the app starts
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Clean up the subscription when the component unmounts
    return unsubscribe;
  }, []);

  return (
<NavigationContainer>
      <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#92A3FD'
          ,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: 'white',
        },
      }}>
          <>
          <Stack.Screen
              name="SubscriptionLanding"
              component={SubscriptionScreen}
              options={{ headerShown: false}}
            />
           <Stack.Screen
              name="SignUp"
              component={SignupScreen}
              options={{ headerShown: false}}
            />
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
               options={{ title: 'Login'}}
            />
              <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
        />
        <Stack.Screen 
        name="WorkoutSelection" 
        component={WorkoutSelection}
        options={{ title: 'Workout Selection', headerRight: () => <LogoutButton /> }}
        />
        <Stack.Screen
         name="Timer"
          component={Timer}
          options={{ headerShown: false}}/>
          </>
          <Stack.Screen
          name="OutdoorTimer"
          component={OutdoorTimer} />
                    <Stack.Screen
          name="ForgottenPassword"
          component={ForgottenPassword}
          options={{title: 'Forgotten Password Reset'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

