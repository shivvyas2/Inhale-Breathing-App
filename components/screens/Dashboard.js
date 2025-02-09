import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Dashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello Shiv,</Text>
          <Text style={styles.subGreeting}>Good Afternoon</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Ionicons name="water" size={24} color="#7C4DFF" />
          <Text style={styles.score}>29</Text>
        </View>
      </View>

      {/* Main Action Button */}
      <TouchableOpacity style={styles.startButton}>
        <Ionicons name="flower-outline" size={50} color="white" />
        <Text style={styles.startButtonText}>Let's Start</Text>
      </TouchableOpacity>

      {/* Additional Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.circleButton}>
          <Ionicons name="notifications-outline" size={24} color="#7C4DFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton}>
          <Ionicons name="hourglass-outline" size={24} color="#7C4DFF" />
        </TouchableOpacity>
      </View>

      {/* Meditation Icon */}
      <View style={styles.meditationContainer}>
        <Ionicons name="body-outline" size={60} color="#7C4DFF" />
      </View>

      {/* Quote Section */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteTitle}>Quote of the day</Text>
        <Text style={styles.quoteText}>Believe and you are half way there</Text>
      </View>

      {/* Bottom Navigation Placeholder */}
      <View style={styles.bottomNav}>
        <Ionicons name="home" size={30} color="#7C4DFF" />
        <Ionicons name="calendar-outline" size={30} color="#7C4DFF" />
        <Ionicons name="heart-outline" size={30} color="#7C4DFF" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 20,
    color: '#666',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    marginLeft: 5,
    color: '#7C4DFF',
  },
  startButton: {
    backgroundColor: '#7C4DFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  circleButton: {
    backgroundColor: '#F0EAFA',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meditationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quoteContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  quoteText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
  },
});

export default Dashboard;
