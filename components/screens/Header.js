import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ showBack, navigation }) => {
  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
      )}
      
      <View style={styles.counterContainer}>
        <Image 
          source={require('../../assets/images/fire.png')}
          style={styles.icon}
        />
        <Text style={styles.counterText}>29</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4,
  },
  icon: {
    width: 24,
    height: 24,
  },
  backButton: {
    padding:1,
  }
});

export default Header;

