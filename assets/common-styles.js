import { StyleSheet } from 'react-native';
import { useFonts, Poppins_700Bold } from '@expo-google-fonts/poppins';

export const commonStyles = StyleSheet.create({

    //-------------------------------input boxes--------------------------------------
    input: {
        marginBottom: 10,
        width: 315,
        height: 48,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F7F8F8',
        backgroundColor: '#F7F8F8',
        fontFamily: 'Poppins_700Bold',
        shadowColor: '#1D1617',
        shadowOffset: {
          width: 0,
          height: 20,
        },
        shadowOpacity: 0.07,
        shadowRadius: 40,
        borderRadius: 16,
        elevation: 2,
        backgroundColor: '#FFFFFF',
      },
      //-----------------------button----------------------------------------------------
      button: { 
        textAlign: 'center',
      //  marginBottom: 30,
        width: 345,
        height: 60,
        padding: 18,
        borderRadius: 99,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: 'rgba(149, 173, 254, 0.3)',
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 22,
      },
      smallButton: { 
        textAlign: 'center',
        marginBottom: 60,
        width: 172,
        height: 60,
        padding: 18,
        borderRadius: 99,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: 'rgba(149, 173, 254, 0.3)',
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 22,
      },
      //button with linear gradient background
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
      //-------------card---------------------------------------------------------
      card: { 
        textAlign: 'center',
        marginBottom: 30
        ,
        width: 345,
        height: 100,
        padding: 18,
        borderRadius: 20,
        flexDirection: 'row',
      //  justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 50,
      },
      cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginRight: 20,
        marginTop: 30,
        marginBottom: 20,
        justifyContent: 'center',
      },
      cardGradient: {
        flex: 1,
        height: 100,
        borderRadius: 20,
        flexDirection: 'row',
      },
      cardText: {
        alignSelf: 'center',
        color: '#000000',
        fontFamily: 'Poppins_700Bold',
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 24,
      },
      header: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
        whiteCard: {
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        width: 345,
        height: 70,
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
        borderRadius: 16,
        elevation: 2,
        backgroundColor: '#FFFFFF',
      },
      checkboxText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        marginLeft: 8,
        marginTop: 5,
        color: 'blue'
       // flexDirection: 'row',
       // alignItems: 'center',
      },
      checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginLeft: -30
      },
      checkbox:{
        justifyContent: 'flex-start',
      }
});

export const header = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#f4511e',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
});