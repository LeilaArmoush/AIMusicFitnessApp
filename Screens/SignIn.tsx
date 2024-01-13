import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text} from 'react-native';
import { handleSignIn } from '../firebaseconfig'; // Import your handleSignIn function
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { MaterialCommunityIcons  } from '@expo/vector-icons'; 
import { commonStyles } from '../assets/common-styles'
import { SvgXml } from 'react-native-svg';
import { runBeatsTitleAndLogo } from '../assets/RunBeatsLogoAndTitle';
import { auth } from '../firebaseconfig';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [isChecked, setChecked] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
  });

  const route = useRoute();

  const handleSignInPress = async () => {
    try {
      const userProfile = await handleSignIn(email, password);
     
     navigation.navigate('Welcome', { userProfile });
        
    } catch (error) {
      Alert.alert('Sign In Failed', error.message);
    }
  };
  
  const navigateToSignUp = async () => {
  navigation.navigate('SignUp');
  }

  const handleForgottenPassword = async (email) => {
    navigation.navigate('ForgottenPassword');
  }

  if (!fontsLoaded) {
    // Font not yet loaded, you can return a loading indicator or wait
    return null;
    
  }

  return (
    <View style={styles.container}>
           <View>
    <SvgXml width={150} height={100} xml={ runBeatsTitleAndLogo } />
    <Text style={styles.logoText}>{'Run Flow'}</Text>
         </View>
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
    <TouchableOpacity  style={commonStyles.checkboxText} onPress={handleForgottenPassword} >
      <Text style={[commonStyles.checkboxText, {color:'#C58BF2'}, {marginTop: -10}, {marginBottom: 10}]}>{'forgotten password?' }</Text>
      </TouchableOpacity>
      <TouchableOpacity  style={commonStyles.button} onPress={handleSignInPress} >
    <LinearGradient
  colors={['#92A3FD', '#9DCEFF']}
  style={commonStyles.buttonGradient}
  start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}> 
    <Text style={commonStyles.buttonText}><MaterialCommunityIcons name="login" size={24} color="white" />  {"Login"}</Text>   
</LinearGradient>
</TouchableOpacity>
<Text style={styles.text}>{'Don\'t have an account?'}</Text>
    <Text style={styles.loginText} selectionColor={'#C58BF2'} onPress={navigateToSignUp}>
      {"Create Account"}
    </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: { 
    textAlign: 'center',
    marginBottom: 60,
    width: 345,
    height: 60,
    padding: 18,
   // backgroundColor: '#92A3FD',
    borderRadius: 99,
    flexDirection: 'row',
  //  justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: 'rgba(149, 173, 254, 0.3)',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 22,
  },
  buttonGradient: {
    flex: 1,
    height: 60,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    alignSelf: 'center',
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
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
  text: {
    fontFamily: 'Poppins_400Regular',
    marginRight: 5, // Adjust the spacing between the texts
    flexWrap: 'wrap',
    alignSelf: 'center',
    marginTop: 20,
  },
  loginText: {
    fontFamily: 'Poppins_400Regular',
    color: '#C58BF2',
   // marginTop: 20, // Adjust the marginTop as needed
  },
});

export default SignInScreen;
