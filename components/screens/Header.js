import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <Image 
          source={require('../../assets/images/fire.png')} // Adjust the path based on your file structure
          style={styles.icon}
        />
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
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4, // Fallback for gap
  },
  icon: {
    width: 24,
    height: 24,
  }
});

export default Header;