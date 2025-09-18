// Dashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { db, supabase } from '../../supabase';
import { Ionicons } from '@expo/vector-icons';

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

  const { isLoaded: userLoaded, user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    fetchQuote();
    if (userLoaded && user) {
      fetchUserData();
    }
    const date = new Date();
    setCurrentDate(date.getDate().toString());
    setCurrentMonth(date.toLocaleString('default', { month: 'short', year: 'numeric' }));
  }, [userLoaded, user]);

  const fetchUserData = async () => {
    try {
      // Use Clerk user for authentication
      if (!user) {
        console.log('No Clerk user found');
        navigation.navigate('Login');
        setLoading(false);
        return;
      }
      console.log('Clerk user ID:', user.id);
      console.log('Clerk user data:', {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress
      });

      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('music')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw testError;
      }
      console.log('Supabase connection test passed');

      // Get user profile via backend API (bypasses RLS issues)
      let userProfile;
      try {
        console.log('Fetching user profile via backend API...');
        const response = await fetch(`http://localhost:3000/api/users/${user.id}`);
        const result = await response.json();
        
        if (response.ok) {
          userProfile = result.data;
          console.log('User profile loaded via backend:', userProfile);
        } else {
          throw new Error(result.error || 'Failed to fetch user profile');
        }
      } catch (error) {
        console.log('User profile not found, creating new profile via backend...');
        // Use Clerk username if available, otherwise extract from email
        const clerkUsername = user.username || user.firstName || user.lastName;
        const emailUsername = user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'user';
        const displayUsername = clerkUsername || emailUsername;
        
        // Extract first and last names from various possible locations in Clerk user object
        const firstName = user.firstName || 
                         user.first_name || 
                         user.givenName || 
                         user.name?.split(' ')[0] || 
                         null;
        const lastName = user.lastName || 
                        user.last_name || 
                        user.familyName || 
                        user.name?.split(' ').slice(1).join(' ') || 
                        null;
        
        console.log('Extracted names:', { firstName, lastName });
        
        try {
          const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerk_id: user.id,
              username: displayUsername,
              first_name: firstName,
              last_name: lastName,
              email: user.primaryEmailAddress?.emailAddress || '',
              level: 1,
              points: 0,
              streak: 0,
              total_minutes: 0
            })
          });
          
          const result = await response.json();
          
          if (response.ok) {
            userProfile = result.data;
            console.log('New user profile created via backend:', userProfile);
          } else if (result.error && result.error.includes('duplicate key')) {
            // User already exists, try to get the existing profile
            console.log('User already exists, fetching existing profile...');
            const getResponse = await fetch(`http://localhost:3000/api/users/${user.id}`);
            const getResult = await getResponse.json();
            
            if (getResponse.ok) {
              userProfile = getResult.data;
              console.log('Existing user profile loaded:', userProfile);
            } else {
              throw new Error('Failed to get existing user profile');
            }
          } else {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
          }
        } catch (apiError) {
          console.error('Failed to create/get user profile via backend:', apiError);
          // Fall back to default user data
          userProfile = {
            username: displayUsername,
            first_name: firstName,
            last_name: lastName,
            email: user.primaryEmailAddress?.emailAddress || '',
            level: 1,
            points: 0,
            streak: 0,
            total_minutes: 0
          };
        }
      }

      // Set user data
      setUserData({
        username: userProfile?.username || displayUsername,
        level: userProfile?.level || 1,
        points: userProfile?.points || 0,
        streak: userProfile?.streak || 0,
        totalMinutes: userProfile?.total_minutes || 0
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
      
      // Set fallback user data if everything fails
      const clerkUsername = user?.username || user?.firstName || user?.lastName;
      const emailUsername = user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'user';
      const fallbackUsername = clerkUsername || emailUsername;
      setUserData({
        username: fallbackUsername,
        level: 1,
        points: 0,
        streak: 0,
        totalMinutes: 0
      });
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

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // The app will automatically redirect to login screen
              // due to the isSignedIn state change in App.js
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ title, value, unit }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        {title === 'Streak' ? (
          <View style={styles.heartIconContainer}>
            <Image 
              source={require('../../assets/images/health.png')}
              style={styles.healthIcon}
            />
          </View>
        ) : (
          <View style={styles.teardropIconContainer}>
            <Image 
              source={require('../../assets/images/minutes.png')}
              style={styles.streakIcon}
            />
          </View>
        )}
      </View>
      
        {/* Chart visualization */}
        <View style={styles.chartContainer}>
          {title === 'Streak' ? (
            <View style={styles.smoothWaveChart}>
              <View style={styles.waveContainer}>
                {/* Single smooth wave line with gradient */}
                <View style={styles.smoothWaveLine} />
              </View>
            </View>
          ) : (
          <View style={styles.barChart}>
            <View style={[styles.bar, { height: 8, backgroundColor: '#8B5CF6' }]} />
            <View style={[styles.bar, { height: 12, backgroundColor: '#A78BFA' }]} />
            <View style={[styles.bar, { height: 6, backgroundColor: '#C4B5FD' }]} />
            <View style={[styles.bar, { height: 10, backgroundColor: '#8B5CF6' }]} />
            <View style={[styles.bar, { height: 14, backgroundColor: '#A78BFA' }]} />
            <View style={[styles.bar, { height: 8, backgroundColor: '#C4B5FD' }]} />
            <View style={[styles.bar, { height: 11, backgroundColor: '#8B5CF6' }]} />
            <View style={[styles.bar, { height: 9, backgroundColor: '#A78BFA' }]} />
          </View>
        )}
      </View>
      
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{title === 'Streak' ? '15' : value}</Text>
          <Text style={styles.statUnit}>{unit}</Text>
        </View>
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
              <Text style={styles.greeting}>Hello {userData.first_name || user?.firstName || user?.first_name || userData.username},</Text>
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
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={24} color="#6B7280" />
              </TouchableOpacity>
              <Image 
                source={require('../../assets/images/avatar.png')}
                style={styles.avatar}
              />
            </View>
          </View>

          {/* Date and Start Button Section */}
          <View style={styles.dateStartSection}>
            <View style={styles.dateSection}>
              <Text style={styles.todayText}>Today</Text>
              <Text style={styles.dateNumber}>{currentDate}</Text>
              <Text style={styles.monthYear}>{currentMonth}</Text>
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
              <Text style={styles.infoTitle}>Information</Text>
              <TouchableOpacity>
                <View style={styles.dotsContainer}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
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
    alignItems: 'flex-start',
    marginTop: 24,
    marginBottom: 8,
  },
  dateSection: {
    flex: 1,
  },
  todayText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 6,
  },
  dateNumber: {
    fontSize: 72,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 80,
  },
  monthYear: {
    fontSize: 22,
    color: '#6B7280',
  },
  meditationIcon: {
    width: 64,  
    height: 64, 
    tintColor: '#FFFFFF',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#8276EE',
    borderRadius: 24,
    padding: 20,  
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoSection: {
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F7FF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#CDB8FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    // Gradient background effect - glass with stronger purple-pink
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(205, 184, 255, 0.45) 40%, rgba(255, 255, 255, 0.7) 70%, rgba(205, 184, 255, 0.3) 100%)',
    // Glass effect
    backdropFilter: 'blur(10px)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  heartIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthIcon: {
    width: 20,
    height: 20,
    tintColor: '#8B5CF6',
  },
  teardropIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakIcon: {
    width: 20,
    height: 20,
    tintColor: '#8B5CF6',
  },
  chartContainer: {
    height: 40,
    marginBottom: 16,
    justifyContent: 'center',
  },
  smoothWaveChart: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  waveContainer: {
    position: 'relative',
    width: '100%',
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smoothWaveLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#FF6B9D',
    borderRadius: 2,
    position: 'relative',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    // Create wave effect using border radius
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
    gap: 2,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
  quoteSection: {
    marginTop: 20,
    backgroundColor: '#F4F6FA',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(45, 49, 66, 0.1)', 
    shadowColor: '#2D3142',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    // Gradient background mixing 2D3142 and F4F6FA
    background: 'linear-gradient(135deg, rgba(45, 49, 66, 0.05) 0%, rgba(244, 246, 250, 0.9) 50%, rgba(45, 49, 66, 0.08) 100%)',
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3142', 
    marginBottom: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
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

