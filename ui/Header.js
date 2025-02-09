import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons'; // Assuming you're using Expo
// If not using Expo, you'll need to install a suitable icon library

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <Feather name="flame" size={24} color="#8B5CF6" /* violet-500 */ />
        <Text style={styles.counterText}>29</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // If you need to account for status bar:
    // paddingTop: Platform.OS === 'ios' ? 44 : 16,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Note: gap might not work on older RN versions, use marginLeft on counterText instead
  },
  counterText: {
    fontSize: 18,
    fontWeight: '600',
    // If gap doesn't work, use:
    // marginLeft: 4,
  }
});

export default Header;