import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { handleSignUp } from '../firebaseconfig'; // Import your handleSignUp function
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_700Bold, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons'; 
import AppLoading from 'expo-app-loading';
import { signInAnonymously } from "firebase/auth";
import {auth} from '../firebaseconfig';
import { commonStyles } from '../assets/common-styles'
import { SvgXml } from 'react-native-svg';
import { runBeatsTitleAndLogo } from '../assets/RunBeatsLogoAndTitle';
import Checkbox from 'expo-checkbox';
import Linking from 'expo-linking';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [emailVerificationSent, isEmailVerificationSent] = useState(false);

  const handleCheckboxChange = () => {
    setIsCheckboxChecked(!isCheckboxChecked);
  };
  const navigatior = useNavigation();
 
  const [fontsLoaded] = useFonts({
    Poppins_700Bold, Poppins_400Regular
  });

  const handleSignUpPress = async () => {
    if (isCheckboxChecked) {
    try {
      const userProfile = await handleSignUp(email, password);
      isEmailVerificationSent(true);
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    }
  }
  else {
    Alert.alert('Sign Up Failed', 'Please accept the terms and conditions and privacy policy.');
  };
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
    <View>
    <SvgXml width={150} height={100} xml={ runBeatsTitleAndLogo } />
    <Text style={styles.logoText}>{'Run Flow'}</Text>
    </View>
      <TextInput
        style = {commonStyles.input}
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
      <View  style={commonStyles.checkboxContainer}>
       <Checkbox
       style={commonStyles.checkbox}
       value={isCheckboxChecked} 
       onValueChange={handleCheckboxChange}
          color={isCheckboxChecked ? '#92A3FD' : undefined}
        />
        <Text style={[styles.checkboxText, {color: '#000'}]}> 
          I accept the {' '}
             <Text  onPress={() => Linking.openURL('https://tandcsprivacypolicy.web.app/')}
           style={[styles.checkboxText, {color: '#C58BF2'}, {textDecorationLine: 'underline'}]}>
     Terms and Conditions {'\n'} and Privacy Policy.
     </Text> 
    </Text>
        </View>
        {emailVerificationSent ? (<>
          <Text style={styles.verifyEmailText}>{'Please check your email to verify account!'}</Text>
        </>)
      : (<><TouchableOpacity style={commonStyles.button} onPress={handleSignUpPress}>
      <LinearGradient
        colors={['#9DCEFF', '#92A3FD']}
        style={commonStyles.buttonGradient}
        start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>    
      <Text style={commonStyles.buttonText}><AntDesign name="adduser" size={24} color="white" />{"  Sign Up"}</Text>
      </LinearGradient>
      </TouchableOpacity>
      </>)}
      <View style={styles.textContainer}>
  <View style={styles.rowContainer}>
    <Text style={styles.text}>{'Already have an account?'}</Text>
    <Text style={styles.loginText} selectionColor={'#C58BF2'} onPress={navigateToSignIn}>
      {"Login"}
    </Text>
  </View>
  <View style={styles.rowContainer}>
    <Text style={styles.text}>{'Sign Up Later?'}</Text>
    <Text style={styles.loginText} selectionColor={'#C58BF2'} onPress={navigateToWelcome}>
      {"Skip For Now"}
    </Text>
  </View>
</View>
     {/*<TouchableOpacity  style={commonStyles.button} onPress={handleSkipSignIn} >     
      <LinearGradient
        colors={['#C58BF2', '#EEA4CE']}
        style={commonStyles.buttonGradient}
        start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>        
      <Text style={commonStyles.buttonText}>{"Skip for Now  "}<Feather name="skip-forward" size={24} color="white"/></Text>
      </LinearGradient>
      </TouchableOpacity> */}
    </View>
  );
};
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginTop: 20,

  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5, // Adjust marginBottom between rows if needed
  },
  textInput: {
    fontFamily: 'Poppins_400Regular',
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    marginLeft: 8,
    marginTop: 5,
    
    
   // flexDirection: 'row',
   // alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: -30
  },
  text: {
    fontFamily: 'Poppins_400Regular',
    marginRight: 5, // Adjust the spacing between the texts
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
  verifyEmailText: {
    fontFamily: 'Poppins_700Bold',
    marginRight: 5, // Adjust the spacing between the texts
    flexWrap: 'wrap',
    alignSelf: 'center',
    fontSize: 15,
  },
  loginText: {
    fontFamily: 'Poppins_400Regular',
    color: '#C58BF2',
   // marginTop: 20, // Adjust the marginTop as needed
  },
  orContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  orText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'black'
  },
  logoText: {
    fontFamily: 'Poppins_700Bold',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    fontSize: 25,
    color: '#C58BF2',
    marginBottom: 20,
  },
  checkbox:{
    justifyContent: 'flex-start',
  }
});

export default SignUpScreen;