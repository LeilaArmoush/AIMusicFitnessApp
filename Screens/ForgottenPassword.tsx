import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { MaterialCommunityIcons  } from '@expo/vector-icons'; 
import { commonStyles } from '../assets/common-styles'
import { SvgXml } from 'react-native-svg';
import { runBeatsTitleAndLogo } from '../assets/RunBeatsLogoAndTitle';
import { handlePasswordReset } from '../firebaseconfig';

const ForgottenPassword = () => {
  const [email, setEmail] = useState('');
  const [passwordSent, setPasswordSent] = useState(false); 
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
  });

  const route = useRoute();

  const handlePressPasswordReset = async () => {
    try { 
      console.log('email', email);
    await handlePasswordReset(email);
    setPasswordSent(true);
        
    } catch (error) {
      Alert.alert('Sending Reset Password Failed', error.message);
    }
  }; 

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
      {passwordSent ? (<>
         <Text style={styles.verifyEmailText}>{'Check your email to reset password!'}</Text>
         </>
      ):(
        <><TouchableOpacity style={commonStyles.button} onPress={handlePressPasswordReset}>
        <LinearGradient
          colors={['#9DCEFF', '#92A3FD']}
          style={commonStyles.buttonGradient}
          start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>    
        <Text style={commonStyles.buttonText}><MaterialCommunityIcons name="login" size={24} color="white" />{"  Reset Password"}</Text>
        </LinearGradient>
        </TouchableOpacity>
        </>)}
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
  verifyEmailText: {
    fontFamily: 'Poppins_700Bold',
    marginRight: 5, // Adjust the spacing between the texts
    flexWrap: 'wrap',
    alignSelf: 'center',
    fontSize: 15,
  },
});

export default ForgottenPassword;
