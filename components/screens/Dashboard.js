// Dashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';  // Added setDoc here
import { db, auth } from '../../firebase';  // Update this path based on your file structure

const Dashboard = ({ navigation }) => {
  const [quote, setQuote] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    username: '',
    level: 0,
    points: 0,
    streak: 0,
    totalMinutes: 0
  });

  useEffect(() => {
    fetchQuote();
    fetchUserData();
    const date = new Date();
    setCurrentDate(date.getDate().toString());
    setCurrentMonth(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
  }, []);
  const fetchUserData = async () => {
    try {
      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No user logged in');
        navigation.navigate('Login');
        setLoading(false);
        return;
      }
  
      console.log('Current user ID:', currentUser.uid);
  
      // Extract username from email (everything before @gmail.com)
      const emailUsername = currentUser.email ? currentUser.email.split('@')[0] : 'user';
  
      // Get the user document directly from the users collection
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        // User exists, use their current data
        const data = userDoc.data();
        console.log('Existing user data found:', data);
        setUserData({
          username: data.username,
          level: data.level,
          points: data.points,
          streak: data.streak,
          totalMinutes: data.totalMinutes
        });
      } else {
        // User doesn't exist, create new document with 0 values
        console.log('Creating new user with email username:', emailUsername);
        const initialUserData = {
          username: emailUsername,
          level: 0,
          points: 0,
          streak: 0,
          totalMinutes: 0
        };
        
        await setDoc(userDocRef, initialUserData);
        setUserData(initialUserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchQuote = async () => {
    try {
      const response = await fetch('https://zenquotes.io/api/random');
      const [data] = await response.json();
      setQuote(data.q);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote('Believe and you are half way there');
    }
  };

  const StatCard = ({ title, value, unit, chart }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        {title === 'Streak' ? (
          <Image 
            source={require('../../assets/images/health.png')}
            style={styles.statIcon}
          />
        ) : (
          <Image 
            source={require('../../assets/images/minutes.png')}
            style={styles.statIcon}
          />
        )}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
      {chart}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View>
              <Text style={styles.greeting}>Hello {userData.username},</Text>
              <View style={styles.levelContainer}>
                <Image 
                  source={require('../../assets/images/level.png')}
                  style={styles.levelIcon}
                />
                <Text style={styles.levelText}>Level {userData.level}</Text>
                <Image 
                  source={require('../../assets/images/magicpen.png')}
                  style={styles.pointsIcon}
                />
                <Text style={styles.pointsText}>{userData.points} pts.</Text>
              </View>
            </View>
            <Image 
              source={require('../../assets/images/avatar.png')}
              style={styles.avatar}
            />
          </View>

          {/* Date and Start Button Section */}
          <View style={styles.dateStartSection}>
            <View style={styles.dateSection}>
              <Text style={styles.todayText}>Today</Text>
              <Text style={styles.dateNumber}>{currentDate}</Text>
              <Text style={styles.monthYear}>{currentMonth}</Text>
            </View>
            
            {/* Vertical buttons container */}
            <View style={styles.verticalButtons}>
              <TouchableOpacity style={styles.iconButton}>
                <Image 
                  source={require('../../assets/images/bell.png')}
                  style={styles.iconButtonImage}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Image 
                  source={require('../../assets/images/history.png')}
                  style={styles.iconButtonImage}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => navigation.navigate('MoodScreen')}
            >
              <Image 
                source={require('../../assets/images/meditation.png')}
                style={styles.meditationIcon}
              />
              <Text style={styles.startText}>Let's Start</Text>
            </TouchableOpacity>
          </View>

          {/* Information Section */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.infoTitle}>Stats</Text>
              <TouchableOpacity>
                <Image 
                  source={require('../../assets/images/fire.png')}
                  style={styles.moreIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.statsContainer}>
              <StatCard 
                title="Streak" 
                value={userData.streak.toString()} 
                unit="Days"
              />
              <StatCard 
                title="Total Minutes" 
                value={userData.totalMinutes.toString()} 
                unit="Minutes"
              />
            </View>
          </View>

          {/* Quote Section */}
          <View style={styles.quoteSection}>
  <Text style={styles.quoteTitle}>Quote of the day</Text>
  <Text style={styles.quoteText}>"{quote}"</Text>
</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelIcon: {
    width: 20,
    height: 20,
    tintColor: '#8B5CF6',
  },
  levelText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  pointsIcon: {
    width: 20,
    height: 20,
    tintColor: '#8B5CF6',
    marginLeft: 12,
  },
  pointsText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  dateStartSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
  },
  dateSection: {
    flex: 1,
  },
  verticalButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 120,
    marginRight: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonImage: {
    width: 24,
    height: 24,
    tintColor: '#6B7280',
  },
  todayText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 64,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 72,
  },
  monthYear: {
    fontSize: 20,
    color: '#6B7280',
  },
 meditationIcon: {
  width: 56,  // Increased from 40
  height: 56, // Increased from 40
  tintColor: '#FFFFFF',
  marginBottom: 8,
},
startButton: {
  backgroundColor: '#8B5CF6',
  borderRadius: 20,
  padding: 16,  // Slightly adjusted padding to accommodate larger icon
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: 120,
  height: 120,
},
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoSection: {
    marginTop: 40,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  moreIcon: {
    width: 24,
    height: 24,
    tintColor: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(205, 184, 255, 0.3)', 
    borderRadius: 20,
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    color: '#4B5563',
  },
  statIcon: {
    width: 20,
    height: 20,
    tintColor: '#8B5CF6',
  },
  statContent: {
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  streakChart: {
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
  },
  minutesChart: {
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
  },
 // Update these styles in your StyleSheet
quoteSection: {
  marginTop: 24,
  backgroundColor: 'rgba(139, 92, 246, 0.05)', // Very light purple background
  borderRadius: 20,
  padding: 24,
  borderWidth: 1,
  borderColor: 'rgba(139, 92, 246, 0.1)', // Subtle border
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.05,
  shadowRadius: 5,
  elevation: 2,
},
quoteTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#8B5CF6', // Purple color for title
  marginBottom: 16,
  letterSpacing: 0.5,
},
quoteText: {
  fontSize: 16,
  color: '#4B5563',
  lineHeight: 24,
  fontStyle: 'italic',
  paddingHorizontal: 8,
  textAlign: 'center',
  letterSpacing: 0.3,
},
});

export default Dashboard;