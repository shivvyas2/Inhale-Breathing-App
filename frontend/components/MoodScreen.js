// components/MoodScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../stores/useAuthStore';
import Header from './screens/Header';

const { width } = Dimensions.get('window');
const OPTION_WIDTH = (width - 60) / 2;

const MoodScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const setStoreMood = useAuthStore((state) => state.setSelectedMood);

  const moods = [
    { 
      id: 1, 
      label: 'Anxious', 
      icon: 'pulse',
      pattern: {
        inhale: 4,
        hold1: 7,
        exhale: 8,
        hold2: 0
      }
    },
    { 
      id: 2, 
      label: 'Distracted', 
      icon: 'trail-sign-outline',
      pattern: {
        inhale: 4,
        hold1: 4,
        exhale: 4,
        hold2: 4
      }
    },
    { 
      id: 3, 
      label: 'Sleepy', 
      icon: 'moon',
      pattern: {
        inhale: 4,
        hold1: 0,
        exhale: 6,
        hold2: 2
      }
    },
  ];
  const activities = [
    { id: 1, label: 'Wind Down', icon: 'leaf' },
    { id: 2, label: 'Focus', icon: 'infinite' },
    { id: 3, label: 'Sleep', icon: 'bed' },
  ];

  const handleNext = () => {
    if (selectedMood && selectedActivity) {
      const selectedMoodData = moods.find(mood => mood.id === selectedMood.id);
      setStoreMood({ 
        mood: selectedMood, 
        activity: selectedActivity,
        breathingPattern: selectedMoodData.pattern
      });
      navigation.navigate('ChooseSound');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <Header showBack navigation={navigation} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>What's your mood?</Text>
          <Text style={styles.subtitle}>Select how you're feeling right now</Text>
          
          <View style={styles.optionsContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.option,
                  selectedMood?.id === mood.id && styles.selectedOption
                ]}
                onPress={() => setSelectedMood(mood)}
              >
                <Ionicons 
                  name={mood.icon} 
                  size={24} 
                  color={selectedMood?.id === mood.id ? '#FFFFFF' : '#8B5CF6'} 
                />
                {selectedMood?.id === mood.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  </View>
                )}
                <Text style={[
                  styles.optionText,
                  selectedMood?.id === mood.id && styles.selectedOptionText
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedMood && (
            <View style={styles.activitySection}>
              <Text style={styles.title}>What's your goal?</Text>
              <Text style={styles.subtitle}>Choose what you'd like to achieve</Text>
              
              <View style={styles.optionsContainer}>
                {activities.map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={[
                      styles.option,
                      selectedActivity?.id === activity.id && styles.selectedOption
                    ]}
                    onPress={() => setSelectedActivity(activity)}
                  >
                    <Ionicons 
                      name={activity.icon} 
                      size={24} 
                      color={selectedActivity?.id === activity.id ? '#FFFFFF' : '#8B5CF6'} 
                    />
                    {selectedActivity?.id === activity.id && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                      </View>
                    )}
                    <Text style={[
                      styles.optionText,
                      selectedActivity?.id === activity.id && styles.selectedOptionText
                    ]}>
                      {activity.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {selectedMood && selectedActivity && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  option: {
    width: OPTION_WIDTH,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedOption: {
    backgroundColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 8,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 2,
  },
  activitySection: {
    marginTop: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default MoodScreen;

