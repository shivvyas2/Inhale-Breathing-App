import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { INSTRUMENT_PROMPTS, getDefaultInstrumentsForMood } from '../config/instrumentPrompts';

const { width } = Dimensions.get('window');

const InstrumentSelector = ({ 
  mood, 
  onInstrumentsChange, 
  initialInstruments = null,
  style = {} 
}) => {
  const [selectedInstruments, setSelectedInstruments] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categories] = useState(['Strings', 'Synth', 'Piano', 'Ambient', 'Nature', 'Vocals', 'Bass', 'Percussion', 'Melody', 'Rhythm']);

  // Initialize with default instruments for mood
  useEffect(() => {
    if (initialInstruments) {
      setSelectedInstruments(initialInstruments);
    } else if (mood) {
      const defaults = getDefaultInstrumentsForMood(mood);
      const instrumentMap = {};
      defaults.forEach(inst => {
        instrumentMap[inst.id] = inst.weight;
      });
      setSelectedInstruments(instrumentMap);
    }
  }, [mood, initialInstruments]);

  // Notify parent of changes
  useEffect(() => {
    const activeInstruments = Object.entries(selectedInstruments)
      .filter(([id, weight]) => weight > 0)
      .map(([id, weight]) => {
        const instrument = INSTRUMENT_PROMPTS.find(inst => inst.id === id);
        return { ...instrument, weight };
      });
    
    onInstrumentsChange(activeInstruments);
  }, [selectedInstruments, onInstrumentsChange]);

  const updateInstrumentWeight = (instrumentId, weight) => {
    setSelectedInstruments(prev => ({
      ...prev,
      [instrumentId]: Math.max(0, Math.min(2, weight))
    }));
  };

  const toggleInstrument = (instrumentId) => {
    setSelectedInstruments(prev => {
      const currentWeight = prev[instrumentId] || 0;
      return {
        ...prev,
        [instrumentId]: currentWeight > 0 ? 0 : 1.0
      };
    });
  };

  const getInstrumentsByCategory = (category) => {
    return INSTRUMENT_PROMPTS.filter(inst => inst.category === category);
  };

  const renderInstrumentKnob = (instrument) => {
    const weight = selectedInstruments[instrument.id] || 0;
    const isActive = weight > 0;
    
    return (
      <View key={instrument.id} style={styles.instrumentItem}>
        <TouchableOpacity
          style={[
            styles.instrumentButton,
            isActive && { backgroundColor: instrument.color + '20' }
          ]}
          onPress={() => toggleInstrument(instrument.id)}
        >
          <View style={[styles.colorIndicator, { backgroundColor: instrument.color }]} />
          <Text style={[styles.instrumentName, isActive && styles.activeInstrumentName]}>
            {instrument.name}
          </Text>
          {isActive && (
            <Text style={styles.weightText}>
              {weight.toFixed(1)}
            </Text>
          )}
        </TouchableOpacity>
        
        {isActive && (
          <View style={styles.knobContainer}>
            <TouchableOpacity
              style={styles.knobButton}
              onPress={() => updateInstrumentWeight(instrument.id, Math.max(0, weight - 0.2))}
            >
              <MaterialCommunityIcons name="minus" size={16} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.knobTrack}>
              <View 
                style={[
                  styles.knobFill, 
                  { 
                    width: `${(weight / 2) * 100}%`,
                    backgroundColor: instrument.color 
                  }
                ]} 
              />
              <View 
                style={[
                  styles.knobHandle,
                  { 
                    left: `${(weight / 2) * 100}%`,
                    backgroundColor: instrument.color 
                  }
                ]} 
              />
            </View>
            
            <TouchableOpacity
              style={styles.knobButton}
              onPress={() => updateInstrumentWeight(instrument.id, Math.min(2, weight + 0.2))}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderCategory = (category) => {
    const instruments = getInstrumentsByCategory(category);
    const isExpanded = expandedCategory === category;
    
    return (
      <View key={category} style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => setExpandedCategory(isExpanded ? null : category)}
        >
          <Text style={styles.categoryTitle}>{category}</Text>
          <MaterialCommunityIcons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.instrumentsList}>
            {instruments.map(renderInstrumentKnob)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Select Instruments</Text>
      <Text style={styles.subtitle}>Adjust the intensity of each instrument</Text>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {categories.map(renderCategory)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  instrumentsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  instrumentItem: {
    marginBottom: 12,
  },
  instrumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  instrumentName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activeInstrumentName: {
    color: '#1f2937',
    fontWeight: '600',
  },
  weightText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  knobContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  knobButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginHorizontal: 12,
    position: 'relative',
  },
  knobFill: {
    height: '100%',
    borderRadius: 3,
  },
  knobHandle: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default InstrumentSelector;
