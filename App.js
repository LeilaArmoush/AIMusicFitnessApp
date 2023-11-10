import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import "react-native-gesture-handler";
import Navigation from './Navigation';
import { name as appName } from './app.json';
import { AppRegistry } from 'react-native';

const App = () => {
  return (
    <Navigation />
  );
};

AppRegistry.registerComponent(appName, () => App);

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});