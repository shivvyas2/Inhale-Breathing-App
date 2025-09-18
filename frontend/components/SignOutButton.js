import React from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../supabase';

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      // Clear any Supabase session data if needed
      try {
        await db.signOut();
      } catch (supabaseError) {
        console.warn('Supabase signout warning:', supabaseError);
        // Continue with Clerk signout even if Supabase cleanup fails
      }
      
      // Calling signOut will automatically clear the session and update the
      // isLoaded/isSignedIn state in App.js, triggering the redirect.
      await signOut();
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <TouchableOpacity onPress={handleSignOut} style={styles.button}>
      <Text style={styles.buttonText}>Sign out</Text>
    </TouchableOpacity>
  );
};

// Basic styling for the button
const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#dc3545', // Example red color
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, // Add some margin
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
