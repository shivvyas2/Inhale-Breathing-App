import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
// Removed moti import - using regular View instead
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../supabase';

const { width } = Dimensions.get('window');

const CongratsBottomSheet = ({ navigation, sessionData = {} }) => {
  const [streak, setStreak] = React.useState(0);
  const [points, setPoints] = React.useState(0);
  const { user } = useUser();

  React.useEffect(() => {
    if (user) {
      createSession();
    }
  }, [user]);

  const createSession = async () => {
    try {
      if (!user) return;

      // Create session record
      const sessionRecord = {
        user_id: user.id,
        session_type: sessionData.type || 'breathing',
        duration_minutes: sessionData.duration || 5,
        points_earned: 10,
        mood_id: sessionData.moodId,
        activity_id: sessionData.activityId,
        breathing_pattern: sessionData.breathingPattern,
      };

      await db.createSession(sessionRecord);

      // Get updated user data (streak will be automatically updated by createSession)
      const updatedProfile = await db.getUserProfile(user.id);
      
      setStreak(updatedProfile.streak);
      setPoints(updatedProfile.points);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleContinue = () => {
    // Use the same navigation pattern as "Let's Start"
    navigation.navigate('TabNavigator');
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.content}>
        <View style={styles.handle} />
        
        <View style={styles.congratsContainer}>
          <Text style={styles.congratsText}>Congratulations!</Text>
          <Text style={styles.subText}>You've completed your breathing session</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>+10</Text>
              <Text style={styles.statLabel}>Points Earned</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    padding: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 32,
  },
  congratsContainer: {
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    width: (width - 80) / 2,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  button: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CongratsBottomSheet;

