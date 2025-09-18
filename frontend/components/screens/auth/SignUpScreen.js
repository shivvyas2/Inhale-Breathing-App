import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSignUp } from '@clerk/clerk-expo';
import { Menu, Button, Divider, Provider } from 'react-native-paper';

// Country code data
const countryCodes = [
  { code: '+1', country: 'United States/Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+52', country: 'Mexico' },
  { code: '+55', country: 'Brazil' },
  // Add more country codes as needed
];

export default function SignUpScreen({ navigation }) {
  // Wrap component with Provider from react-native-paper
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle keypad input for verification code (6 digits)
  const handleKeyPress = (value) => {
    setCode(prev => {
      if (value === 'backspace') return prev.slice(0, -1);
      if (prev.length < 6) return prev + value;
      return prev;
    });
  };

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasSymbol: false,
    hasNumber: false,
  });

  // Validate all password requirements
  useEffect(() => {
    setPasswordValidation({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [password]);

  // Check if all password requirements are met
  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(value => value === true);
  };

  // Validate phone number format (should be E.164 format)
  const validatePhoneNumber = (phone) => {
    // Basic E.164 format validation: + followed by digits
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  // Combine country code and phone number
  const getFullPhoneNumber = () => {
    return countryCode + phoneNumber;
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Validate all required fields
    if (!emailAddress || !password || !username || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Password validation
    if (!isPasswordValid()) {
      Alert.alert('Error', 'Password does not meet all requirements');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating signup with:', { emailAddress, username, firstName, lastName });

      // Create the signup with required fields
      const signUpResult = await signUp.create({
        emailAddress: emailAddress,
        password,
        username,
        firstName: firstName,
        lastName: lastName,
      });

      console.log('Sign up result:', signUpResult);

      // Check for any missing input fields
      const missingFields = signUpResult.missingFields || [];
      if (missingFields.length > 0) {
        Alert.alert(
          'Missing Information',
          `Please provide: ${missingFields.join(', ')}`,
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      console.error('Sign up error:', JSON.stringify(err, null, 2));

      // Check for network errors
      if (err.message && err.message.includes('Network request failed')) {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else {
        // Handle other errors
        const errorMessage = err.errors ? err.errors[0].message : 'An unknown error occurred';
        Alert.alert('Sign Up Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    if (code.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      // Try to verify the email
      console.log('Attempting email verification with code:', code);
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log('Verification result:', completeSignUp);

      // Check verification status
      if (completeSignUp.status === 'complete') {
        // Success - set the active session
        await setActive({ session: completeSignUp.createdSessionId });
      } else if (completeSignUp.status === 'missing_requirements') {
        // Check if email was verified successfully even if phone is pending
        if (completeSignUp.verifications.emailAddress.status === 'verified') {
          console.log('Email verified successfully, proceeding with sign up');
          // Create a session anyway, even though phone verification is pending
          try {
            await setActive({ session: completeSignUp.createdSessionId || null });
            // Navigation will happen via the Clerk listener in the app
          } catch (err) {
            console.error('Error setting active session:', err);
            Alert.alert(
              'Sign Up Complete',
              'Your email has been verified. You can now sign in with your credentials.',
              [{ text: 'OK' }]
            );
            navigation.navigate('Login');
          }
        } else {
          // Still need to complete email verification
          Alert.alert(
            'Verification Required',
            'Please complete the email verification process.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        Alert.alert('Verification Error', 'Could not complete verification.');
      }
    } catch (err) {
      console.error('Verification error:', JSON.stringify(err, null, 2));

      // Handle network errors specifically
      if (err.message && err.message.includes('Network request failed')) {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else {
        // Handle other errors
        const errorMessage = err.errors ? err.errors[0].message : 'Invalid verification code or an error occurred.';
        Alert.alert('Verification Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, pendingVerification ? styles.progressActive : styles.progressInactive]} />
          </View>

          {/* Step Indicator */}
          <Text style={styles.stepText}>{pendingVerification ? 'STEP 2/2' : 'STEP 1/2'}</Text>

          {!pendingVerification ? (
            <>
              {/* Sign Up Form */}
              <Text style={styles.headerText}>Create your account</Text>
              <Text style={styles.subHeaderText}>Fill in your details to get started</Text>
              
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#6B7280"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#6B7280"
                  />
                </View>

                <View style={styles.nameRow}>
                  <View style={[styles.inputContainer, styles.nameInput]}>
                    <TextInput
                      style={styles.input}
                      placeholder="First Name"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      placeholderTextColor="#6B7280"
                    />
                  </View>
                  <View style={[styles.inputContainer, styles.nameInput]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Last Name"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      placeholderTextColor="#6B7280"
                    />
                  </View>
                </View>

                <View style={styles.phoneInputWrapper}>
                  <View style={styles.countryCodeContainer}>
                    <Menu
                      visible={showCountryMenu}
                      onDismiss={() => setShowCountryMenu(false)}
                      contentStyle={styles.menuContent}
                      anchor={
                        <TouchableOpacity
                          style={styles.countryCodeButton}
                          onPress={() => setShowCountryMenu(true)}
                        >
                          <Text style={styles.countryCodeText}>{countryCode}</Text>
                          <Ionicons name="chevron-down" size={16} color="#6B7280" />
                        </TouchableOpacity>
                      }
                    >
                      {countryCodes.map((item) => (
                        <Menu.Item
                          key={item.code}
                          onPress={() => {
                            setCountryCode(item.code);
                            setShowCountryMenu(false);
                          }}
                          title={`${item.code} ${item.country}`}
                          titleStyle={styles.menuItemTitle}
                          style={styles.menuItem}
                        />
                      ))}
                    </Menu>
                  </View>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholderTextColor="#6B7280"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    placeholderTextColor="#6B7280"
                  />
                  <TouchableOpacity style={styles.passwordVisibilityButton}>
                    <Ionicons name="eye-outline" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Password requirements with live validation */}
                <View style={styles.passwordRequirements}>
                  <View style={styles.requirementRow}>
                    <Text style={[
                      styles.passwordRequirementText,
                      passwordValidation.hasMinLength ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      {passwordValidation.hasMinLength ? '✓' : '•'} 8+ characters
                    </Text>
                    <Text style={[
                      styles.passwordRequirementText,
                      passwordValidation.hasUpperCase ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      {passwordValidation.hasUpperCase ? '✓' : '•'} 1 uppercase
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Text style={[
                      styles.passwordRequirementText,
                      passwordValidation.hasSymbol ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      {passwordValidation.hasSymbol ? '✓' : '•'} 1 symbol
                    </Text>
                    <Text style={[
                      styles.passwordRequirementText,
                      passwordValidation.hasNumber ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      {passwordValidation.hasNumber ? '✓' : '•'} 1 number
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={onSignUpPress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Verification Form */}
              <Text style={styles.headerText}>Verify your number</Text>
              <Text style={styles.subHeaderText}>
                We'll text you on {countryCode}{phoneNumber}.
              </Text>

              {/* Code input circles */}
              <View style={styles.codeInputContainer}>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <View key={idx} style={[styles.codeCircle, code.length > idx ? styles.codeCircleFilled : styles.codeCircleEmpty]}>
                    {code.length > idx && <Text style={styles.codeText}>{code[idx]}</Text>}
                  </View>
                ))}
              </View>

              {/* Hidden input that captures the code */}
              <TextInput
                style={styles.hiddenInput}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity style={styles.resendLink}>
                <Text style={styles.resendText}>Send me a new code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={onVerifyPress}
                disabled={isLoading || code.length < 6}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
              
              {/* Numeric Keypad UI */}
              <View style={styles.keypadContainer}>
                <View style={styles.keypadRow}>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('1')}>
                    <Text style={styles.keypadText}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('2')}>
                    <Text style={styles.keypadText}>2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('3')}>
                    <Text style={styles.keypadText}>3</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.keypadRow}>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('4')}>
                    <Text style={styles.keypadText}>4</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('5')}>
                    <Text style={styles.keypadText}>5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('6')}>
                    <Text style={styles.keypadText}>6</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.keypadRow}>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('7')}>
                    <Text style={styles.keypadText}>7</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('8')}>
                    <Text style={styles.keypadText}>8</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('9')}>
                    <Text style={styles.keypadText}>9</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.keypadRow}>
                  <View style={styles.keypadEmpty} />
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('0')}>
                    <Text style={styles.keypadText}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('backspace')}>
                    <Ionicons name="backspace-outline" size={26} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* No Modal here anymore - using React Native Paper Menu component */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    width: '30%',
    marginHorizontal: 5,
    borderRadius: 4,
  },
  progressActive: {
    backgroundColor: '#8B5CF6',
  },
  progressInactive: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  stepText: {
    fontSize: 14,
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 5,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 15,
  },
  formContainer: {
    width: '100%',
    marginBottom: 25,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 0,
  },
  input: {
    flex: 1,
    height: 60,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1F2937',
  },
  passwordVisibilityButton: {
    padding: 15,
  },
  passwordRequirements: {
    marginTop: 5,
    marginBottom: 15,
  },
  requirementRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  passwordRequirementText: {
    fontSize: 14,
    marginRight: 20,
  },
  requirementMet: {
    color: '#10B981', // Green color for met requirements
  },
  requirementNotMet: {
    color: '#6B7280', // Gray color for unmet requirements
  },
  phoneInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 60,
  },
  countryCodeContainer: {
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    minWidth: 60,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#1F2937',
    marginRight: 5,
  },
  // Menu styles
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: 220,
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    height: 48,
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  footerLink: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  codeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeCircleEmpty: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  codeCircleFilled: {
    backgroundColor: '#1F2937',
  },
  codeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
  resendLink: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resendText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
  },
  keypadContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  keypadButton: {
    width: 65,
    height: 62,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadEmpty: {
    width: 65,
    height: 62,
  },
  keypadText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F2937',
  },
});

