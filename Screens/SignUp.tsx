import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { handleSignUp } from '../firebaseconfig'; // Import your handleSignUp function
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_700Bold, Poppins_400Regular } from '@expo-google-fonts/poppins';
import {  AntDesign, Feather  } from '@expo/vector-icons'; 
import AppLoading from 'expo-app-loading';
import { signInAnonymously } from "firebase/auth";
import {auth} from '../firebaseconfig';
import { commonStyles } from '../assets/common-styles'

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigatior = useNavigation(); // Ensure you import useNavigation

  const [fontsLoaded] = useFonts({
    Poppins_700Bold, Poppins_400Regular
  });

  const handleSignUpPress = async () => {
    try {
      const userProfile = await handleSignUp(email, password);
      navigatior.navigate('Welcome', { userProfile });
      
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  const navigateToSignIn = () => {
    // Use navigation to navigate to the Sign In screen
    navigatior.navigate('SignIn');
  };

  const navigateToWelcome = async () => {
    try {
      await navigatior.navigate('Welcome');
    } catch (error) {
      Alert.alert('Navigation Failed', error.message);
    }
  };

  const handleSkipSignIn = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      console.log('Anonymous user created:', user.uid);
      // Navigate to the desired screen or perform additional actions
    } catch (error) {
      console.error('Error creating anonymous user:', error);
    }
    navigateToWelcome();
  };

  if (!fontsLoaded) {
    // Font not yet loaded, you can return a loading indicator or wait
    return null;
  }

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
  return (
    <View style={styles.container}>
      <TextInput
        style={commonStyles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={commonStyles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TouchableOpacity style={commonStyles.button} onPress={handleSignUpPress}>
      <LinearGradient
        colors={['#9DCEFF', '#92A3FD']}
        style={commonStyles.buttonGradient}
        start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>    
      <Text style={commonStyles.buttonText}><AntDesign name="adduser" size={24} color="white" />{"  Sign Up"}</Text>
      </LinearGradient>
      </TouchableOpacity>
      <View>
        <Text style={styles.orText}>Or</Text>
    </View>
    <View style={styles.textContainer}>
      <Text style = {styles.text} >{'Already have an account?'}</Text>
      <Text style={styles.loginText} selectionColor={'#C58BF2'} onPress={navigateToSignIn}> {"Login"}</Text>
      </View>
      <TouchableOpacity  style={commonStyles.button} onPress={handleSkipSignIn} >     
      <LinearGradient
        colors={['#C58BF2', '#EEA4CE']}
        style={commonStyles.buttonGradient}
        start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>        
      <Text style={commonStyles.buttonText}>{"Skip for Now  "}<Feather name="skip-forward" size={24} color="white"/></Text>
      </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
}

const styles = StyleSheet.create({
  container: {
    marginTop: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  text: {
    marginRight: 5, // Adjust the spacing between the texts
    marginTop: 60,
  },

  loginText: {
    color: '#C58BF2',
    marginTop: 60,
  },
  orContainer: {
    flex: 1,
  },
});

export default SignUpScreen;