import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens from your components folder
import OnboardingScreen1 from './components/screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from './components/screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from './components/screens/onboarding/OnboardingScreen3';
import LoginScreen from './components/screens/auth/LoginScreen';
import Dashboard from './components/screens/Dashboard';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#D4E157' }
        }}
      >
        <Stack.Screen 
          name="Onboarding1" 
          component={OnboardingScreen1} 
        />
        <Stack.Screen 
          name="Onboarding2" 
          component={OnboardingScreen2} 
        />
        <Stack.Screen 
          name="Onboarding3" 
          component={OnboardingScreen3} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen 
  name="Dashboard" 
  component={Dashboard}
  options={{ headerShown: false }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

