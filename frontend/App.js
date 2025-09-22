import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import MoodScreen from './components/MoodScreen';
import BreathingScreen from './components/screens/BreathingScreen';
// Import screens from your components folder
import OnboardingScreen1 from './components/screens/onboarding/OnboardingScreen1';
import OnboardingScreen2 from './components/screens/onboarding/OnboardingScreen2';
import OnboardingScreen3 from './components/screens/onboarding/OnboardingScreen3';
import LoginScreen from './components/screens/auth/LoginScreen';
import SignUpScreen from './components/screens/auth/SignUpScreen';
import Dashboard from './components/screens/Dashboard';
import TabNavigator from './navigation/TabNavigator';
import ChooseSound from './components/screens/ChooseSound';
import InstrumentSelectionScreen from './components/screens/InstrumentSelectionScreen';
import Library from './components/screens/Library';
import AIBreathingScreen from './components/screens/AIBreathingScreen';

const Stack = createNativeStackNavigator();

// Token Cache implementation
const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Start with TabNavigator or Dashboard as appropriate */}
    <Stack.Screen name="TabNavigator" component={TabNavigator} /> 
    <Stack.Screen name="Dashboard" component={Dashboard} />
    <Stack.Screen name="MoodScreen" component={MoodScreen} />
    <Stack.Screen name="ChooseSound" component={ChooseSound} />
    <Stack.Screen name="InstrumentSelection" component={InstrumentSelectionScreen} />
    <Stack.Screen name="BreathingScreen" component={BreathingScreen} />
    <Stack.Screen name="AIBreathingScreen" component={AIBreathingScreen} />
    <Stack.Screen
      name="Library"
      component={Library}
      options={{ headerShown: false }}
    />
    {/* Add other non-auth screens here */}
  </Stack.Navigator>
);

// Main App component wrapped with Clerk logic
const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    // Show a loading indicator while Clerk is initializing
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {isSignedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  // Complete any auth session from OAuth flow if present
  WebBrowser.maybeCompleteAuthSession();
  
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file');
  }

  // Get the app scheme from app.json
  const appId = Constants.expoConfig?.scheme || 'inhale';
  const redirectUrl = `${appId}://clerk-redirect`;

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={publishableKey}
      // Add redirect URL for OAuth flows
      fallbackRedirectUrl={redirectUrl}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

