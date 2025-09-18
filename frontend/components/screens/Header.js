import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../supabase';

const Header = ({ showBack, navigation }) => {
  const [streak, setStreak] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        if (user) {
          const userProfile = await db.getUserProfile(user.id);
          if (userProfile) {
            setStreak(userProfile.streak || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching streak:', error);
      }
    };

    fetchStreak();
  }, [user]);

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
        <Text style={styles.counterText}>{streak}</Text>
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
    padding: 1,
  }
});

export default Header;

