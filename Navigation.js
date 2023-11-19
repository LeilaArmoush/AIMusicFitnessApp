import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SignInScreen from './Screens/SignIn'; // Your login screen component
import Planner from './Screens/Planner';
import Timer from './Screens/Timer';
import WorkoutListScreen from "./Screens/WorkoutListScreen";
import { initializeFirebase, auth } from './firebaseconfig'; // Adjust the import path accordingly
import SignupScreen from './Screens/SignUp'; // Import the new SignupScreen


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabGroup() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Planner" component={Planner} />
      <Tab.Screen name="Timer" component={Timer} />
      <Tab.Screen name='WorkoutListScreen' component={WorkoutListScreen} />
    </Tab.Navigator>
  );
}

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
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="App" component={TabGroup} />
        ) : (
          <>
           <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ title: 'Signup' }}
            />
            <Stack.Screen
              name="Login"
              component={SignInScreen}
              options={{ headerShown: false }}
            />
           
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

