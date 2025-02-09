import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Header from './Header';

const Dashboard = ({ navigation }) => {

  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await fetch('https://zenquotes.io/api/random');
      const [data] = await response.json();
      setQuote(data.q);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote('Believe and you are half way there');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingName}>Hello Shiv,</Text>
        <Text style={styles.greetingTime}>Good Afternoon</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Buttons Row */}
        <View style={styles.buttonContainer}>
          {/* Main Start Button */}
          <TouchableOpacity 

          style={styles.mainButton}
          onPress={() => navigation.navigate('MoodScreen')}  // Add this line
        >
          <Image 
            source={require('../../assets/images/lotus.png')}
            style={styles.lotusIcon}
          />
          <View style={styles.startButtonContent}>

            <Image 
              source={require('../../assets/images/play.png')}
              style={styles.playIcon}
            />
            <Text style={styles.startText}>Let's Start</Text>
          </View>
        </TouchableOpacity>

          {/* Circular Buttons */}
          <View style={styles.circularButtonsContainer}>
          <TouchableOpacity 
  style={styles.circleButton}
  onPress={() => navigation.navigate('ReminderScreen')}
>
  <Image 
    source={require('../../assets/images/bell.png')}
    style={styles.circleIcon}
  />
</TouchableOpacity>
            
            <TouchableOpacity style={styles.circleButton}>
              <Image 
                source={require('../../assets/images/history.png')}
                style={styles.circleIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meditation Icon */}
        <View style={styles.meditationContainer}>
          <Image 
            source={require('../../assets/images/meditation.png')}
            style={styles.meditationIcon}
          />
        </View>

        {/* Quote Container */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteTitle}>Quote of the day</Text>
          {loading ? (
            <ActivityIndicator color="#8B5CF6" />
          ) : (
            <Text style={styles.quoteText}>{quote}</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  greetingContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  greetingName: {
    fontSize: 32,
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 38,
  },
  greetingTime: {
    fontSize: 32,
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 38,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 16,
  },
  mainButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 24,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  lotusIcon: {
    width: 90,
    height: 90,
    tintColor: '#FFFFFF',
    marginBottom: 16,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  playIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
    marginRight: 8,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  circularButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  meditationContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  meditationIcon: {
    width: 80,
    height: 80,
    tintColor: '#8B5CF6',
  },
  quoteContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  quoteTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 28,
  },
});

export default Dashboard;

