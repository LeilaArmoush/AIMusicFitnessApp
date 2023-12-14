import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { handleSignUp } from '../firebaseconfig'; // Import your handleSignUp function
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation(); // Ensure you import useNavigation


  const handleSignUpPress = async () => {
    try {
      const userProfile = await handleSignUp(email, password);
      navigation.navigate('Welcome', { userProfile });
      
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  const navigateToSignIn = () => {
    // Use navigation to navigate to the Sign In screen
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Button title="Sign Up" onPress={handleSignUpPress} />
      <Button title="Go to Sign In" onPress={navigateToSignIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
});

export default SignUpScreen;