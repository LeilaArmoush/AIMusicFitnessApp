import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { commonStyles } from "../assets/common-styles";
import { useFonts, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { LinearGradient } from 'expo-linear-gradient';
import AppLoading from 'expo-app-loading';
import { SvgXml } from 'react-native-svg';
import { runBeatsTitleAndLogo } from '../assets/RunBeatsLogoAndTitle';
import { SubscriptionImage } from '../assets/SubscriptionImage';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 

const Subscription = () => {
    const [fontsLoaded] = useFonts({
        Poppins_700Bold
      });

    const [isFreeTrialEnabled, setIsFreeTrialEnabled] = useState(false);
    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(false);

    const navigation = useNavigation();

    const navigateToSignUp = () => {
        // Use navigation to navigate to the Sign In screen
        navigation.navigate('SignUp');
      };

    const toggleFreeTrialSwitch = () => 
    {setIsFreeTrialEnabled(previousState => !previousState);
        if(isFreeTrialEnabled) {
        setIsSubscriptionEnabled(true);
        }
        else
        {
            setIsSubscriptionEnabled(false);
        }
    }
    const toggleSubscriptionSwitch = () =>     
    {setIsSubscriptionEnabled(previousState => !previousState);
        if(!isSubscriptionEnabled)
        {
            setIsFreeTrialEnabled(false);
        }
    }

    if (!fontsLoaded) {
        // Font not yet loaded, you can return a loading indicator or wait
        return null;
      }
    
      if (!fontsLoaded) {
        return <AppLoading />;
      } else {
  return (
    <View style={[styles.container, {backgroundColor: '#FFFFFF'}]}>
    <View>
    <LinearGradient
        colors={isFreeTrialEnabled ? ['rgba(197, 139, 242, 0.2)', 'rgba(238, 164, 206, 0.2)']: ['#F7F8F8', '#F7F8F8']}
        style={commonStyles.whiteCard}
        start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0 }}>  
        <SvgXml width={45} height={39} xml={ runBeatsTitleAndLogo } />
    <Text style={styles.freeTrialText}>    
{isFreeTrialEnabled ? '7 Day Free Trial Enabled':'Enable 7 Day Free Trial'}</Text>
    <Switch
      trackColor={{false: '#92A3FD', true: '#EEA4CE'}}
      thumbColor={isFreeTrialEnabled ? '#C58BF2' : '#9DCEFF'}
      ios_backgroundColor="#3e3e3e"
      onValueChange={toggleFreeTrialSwitch}
      value={isFreeTrialEnabled}
    />
      </LinearGradient>
  </View>
  <LinearGradient
        colors={isSubscriptionEnabled ? ['rgba(197, 139, 242, 0.2)', 'rgba(238, 164, 206, 0.2)']: ['#F7F8F8', '#F7F8F8']}
        style={styles.whiteCardTall}
        start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0 }}>  
  <Text style={styles.subscriptionText}>{isSubscriptionEnabled ? 'Subscription Enabled':'Full Access Subscription'} </Text>
  <View style={styles.toggleButton}>
  <Switch
      trackColor={{false: '#92A3FD', true: '#EEA4CE'}}
      thumbColor={isSubscriptionEnabled ? '#C58BF2' : '#9DCEFF'}
      ios_backgroundColor="#3e3e3e"
      onValueChange={toggleSubscriptionSwitch}
      value={isSubscriptionEnabled}
    /> 
    </View>
    <View style={styles.svgContainer}>
  <SvgXml width="191" height="245" xml={ SubscriptionImage } />
  </View>
  <Text style={styles.priceText}>{'$6.99/month'} </Text>
  </LinearGradient>
  <TouchableOpacity style={commonStyles.button} onPress={navigateToSignUp}>
      <LinearGradient
        colors={['#9DCEFF', '#92A3FD']}
        style={commonStyles.buttonGradient}
        start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>    
      <Text style={styles.buttonText}>{'Continue                       '}<Entypo name="chevron-right" size={24} color="white" /></Text>
      </LinearGradient>
      </TouchableOpacity>
  
  </View>
  );
};
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      },
        freeTrialText: {
          fontFamily: 'Poppins_700Bold',
          marginRight: 5, // Adjust the spacing between the texts
          alignSelf: 'center',
          flexDirection: 'row',
          fontSize: 15,
          color: '#7B6F72'
        },
        svgContainer: {
            flex: 1,
            marginLeft: 50,
        },     
        whiteCardTall: {
            justifyContent: 'space-between',
            marginBottom: 10,
            width: 345,
            height: 400,
            padding: 18,
            borderRadius: 20,
            alignItems: 'center',
            shadowColor: '#1D1617',
            shadowOffset: {
              width: 0,
              height: 20,
            },
            shadowOpacity: 0.07,
            shadowRadius: 40,
            elevation: 2,
            backgroundColor: '#FFFFFF',
          },
          toggleButton: {
            marginLeft: 250,
            marginTop: -65
          }, 
          subscriptionText: {
            fontFamily: 'Poppins_700Bold',
           // marginRight: 150, // Adjust the spacing between the texts
             justifyContent: 'flex-start',
           
            fontSize: 15,
            color: '#7B6F72',
            marginBottom: 25
          },
          priceText: {
            fontFamily: 'Poppins_700Bold',
             fontSize: 40,
             color: '#7B6F72',
          },
          
          textToggleButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            marginLeft: 100
          },
          buttonText: {
            alignSelf: 'center',
            marginLeft: 80,
            color: '#FFFFFF',
            fontFamily: 'Poppins_700Bold',
          //  fontWeight: '700',
            fontSize: 16,
            lineHeight: 24,
          },
});

export default Subscription;