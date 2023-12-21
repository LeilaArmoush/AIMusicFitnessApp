import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text} from 'react-native';
import { handleSignIn } from '../firebaseconfig'; // Import your handleSignIn function
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { MaterialCommunityIcons  } from '@expo/vector-icons'; 
import { commonStyles } from '../assets/common-styles'

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
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

  if (!fontsLoaded) {
    // Font not yet loaded, you can return a loading indicator or wait
    return null;
    
  }

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
      <TouchableOpacity  style={commonStyles.button} onPress={handleSignInPress} >
    <LinearGradient
  colors={['#92A3FD', '#9DCEFF']}
  style={commonStyles.buttonGradient}
  start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}> 
    <Text style={commonStyles.buttonText}><MaterialCommunityIcons name="login" size={24} color="white" />  {"Login"}</Text>   
</LinearGradient>
</TouchableOpacity>
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
});

export default SignInScreen;
