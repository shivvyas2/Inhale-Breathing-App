import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';

// Import screens from your components folder
import OnboardingScreen1 from './components/screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from './components/screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from './components/screens/onboarding/OnboardingScreen3';
import LoginScreen from './components/screens/auth/LoginScreen';
import Dashboard from './components/screens/Dashboard';
import TabNavigator from './navigation/TabNavigator';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* <Stack.Screen name="SignUp" component={SignUpScreen} /> */}
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

