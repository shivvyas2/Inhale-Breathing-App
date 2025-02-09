import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const { width } = Dimensions.get('window');

const CongratsBottomSheet = ({ navigation }) => {
  const [streak, setStreak] = React.useState(0);
  const [points, setPoints] = React.useState(0);

  React.useEffect(() => {
    updateUserStreak();
  }, []);

  const updateUserStreak = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const newStreak = userData.streak + 1;
        const newPoints = userData.points + 10;
        
        await updateDoc(userDocRef, {
          streak: newStreak,
          points: newPoints,
          totalMinutes: userData.totalMinutes + 5
        });

        setStreak(newStreak);
        setPoints(newPoints);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const handleContinue = () => {
    // Use the same navigation pattern as "Let's Start"
    navigation.navigate('Dashboard');
  };

  return (
    <MotiView
      from={{ translateY: 1000 }}
      animate={{ translateY: 0 }}
      transition={{ type: 'spring', damping: 20 }}
      style={styles.container}
    >
      <BlurView intensity={80} style={styles.content}>
        <View style={styles.handle} />
        
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 300 }}
          style={styles.congratsContainer}
        >
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
        </MotiView>
      </BlurView>
    </MotiView>
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