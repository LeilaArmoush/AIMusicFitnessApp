import { View, Text, StyleSheet } from "react-native";

const WelcomeMessage = ({route }) => {

 const userProfile = route.params?.userProfile;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`Hi, ${userProfile?.email || 'User'}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center items horizontally
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default WelcomeMessage;