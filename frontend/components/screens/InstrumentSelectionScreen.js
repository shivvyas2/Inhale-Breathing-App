import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from './Header';
import useAuthStore from '../../stores/useAuthStore';
import { INSTRUMENT_PROMPTS } from '../../config/instrumentPrompts';

const { width } = Dimensions.get('window');

const getDefaultInstrumentsForMood = (mood) => {
  const moodDefaults = {
    'Anxiety Relief': [
      { id: 'lush_strings', weight: 1.5 },
      { id: 'warm_pads', weight: 1.2 },
      { id: 'nature_sounds', weight: 0.8 },
      { id: 'ethereal_voices', weight: 0.6 }
    ],
    'Meditate': [
      { id: 'warm_pads', weight: 1.8 },
      { id: 'chill_piano', weight: 1.0 },
      { id: 'harps', weight: 0.7 },
      { id: 'nature_sounds', weight: 0.5 }
    ],
    'Wind Down': [
      { id: 'lush_strings', weight: 1.3 },
      { id: 'chill_piano', weight: 1.1 },
      { id: 'warm_bass', weight: 0.9 },
      { id: 'warm_pads', weight: 0.8 }
    ],
    'Focus': [
      { id: 'chillwave', weight: 1.4 },
      { id: 'sparkling_arpeggios', weight: 1.0 },
      { id: 'minimal_drums', weight: 0.6 },
      { id: 'warm_bass', weight: 0.8 }
    ]
  };
  return moodDefaults[mood] || moodDefaults['Meditate'];
};

const InstrumentSelectionScreen = ({ navigation }) => {
  const [selectedInstruments, setSelectedInstruments] = useState([]);

  // Initialize with default instruments for current mood
  useEffect(() => {
    const currentMood = useAuthStore.getState().mood?.label || 'Calm';
    const defaults = getDefaultInstrumentsForMood(currentMood);
    setSelectedInstruments(defaults);
  }, []);

  const handleStartSession = () => {
    const store = useAuthStore.getState();
    navigation.navigate('AIBreathingScreen', {
      selectedMood: store.mood?.label || 'Calm',
      breathingPattern: store.breathingPattern || { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
      selectedSound: null,
      useAIMusic: true,
      selectedInstruments: selectedInstruments
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header showBack navigation={navigation} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Choose Your Sound</Text>
          <Text style={styles.subtitle}>
            Select instruments to create your personalized ambient music
          </Text>

          {/* Quick Instrument Selection */}
          <View style={styles.quickInstrumentsContainer}>
            <Text style={styles.sectionTitle}>Quick Selection</Text>
            <View style={styles.quickInstrumentsGrid}>
              {['chill_piano', 'lush_strings', 'warm_pads', 'harps', 'ambient_pads', 'soft_piano', 'ethereal_voices', 'nature_sounds'].map(instrumentId => {
                const instrument = INSTRUMENT_PROMPTS.find(inst => inst.id === instrumentId);
                const isSelected = selectedInstruments.some(inst => inst.id === instrumentId && inst.weight > 0);
                
                return (
                  <TouchableOpacity
                    key={instrumentId}
                    style={[
                      styles.quickInstrumentButton,
                      isSelected && { 
                        backgroundColor: instrument.color + '20', 
                        borderColor: instrument.color,
                        shadowColor: instrument.color,
                        shadowOpacity: 0.3
                      }
                    ]}
                    onPress={() => {
                      const currentWeight = selectedInstruments.find(inst => inst.id === instrumentId)?.weight || 0;
                      const newWeight = currentWeight > 0 ? 0 : 1.0;
                      
                      setSelectedInstruments(prev => {
                        const filtered = prev.filter(inst => inst.id !== instrumentId);
                        if (newWeight > 0) {
                          return [...filtered, { ...instrument, weight: newWeight }];
                        }
                        return filtered;
                      });
                    }}
                  >
                    <View style={[styles.quickInstrumentColor, { backgroundColor: instrument.color }]} />
                    <Text style={[
                      styles.quickInstrumentText,
                      isSelected && { color: instrument.color, fontWeight: '700' }
                    ]}>
                      {instrument.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Start Session Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartSession}
        >
          <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  quickInstrumentsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  quickInstrumentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickInstrumentButton: {
    width: (width - 72) / 2,
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quickInstrumentColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickInstrumentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: -0.2,
  },
});

export default InstrumentSelectionScreen;
