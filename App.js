import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import MoodScreen from './components/MoodScreen';
import BreathingScreen from './components/screens/BreathingScreen';
// Import screens from your components folder
import OnboardingScreen1 from './components/screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from './components/screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from './components/screens/onboarding/OnboardingScreen3';
import LoginScreen from './components/screens/auth/LoginScreen';
import Dashboard from './components/screens/Dashboard';
import TabNavigator from './navigation/TabNavigator';
import ChooseSound from './components/screens/ChooseSound';
const Stack = createNativeStackNavigator();

export default function App() {
  return (

    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* <Stack.Screen name="SignUp" component={SignUpScreen} /> */}
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
            <Stack.Screen name="MoodScreen" component={MoodScreen} />
            <Stack.Screen name="ChooseSound" component={ChooseSound} />
            <Stack.Screen name="BreathingScreen" component={BreathingScreen} /> 
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

