import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import Header from './Header'; // Adjust the import path based on your file structure

const SelectMood = () => {
    const [selectedMood, setSelectedMood] = useState(null);

    const MoodOption = ({ mood, isSelected, onPress }) => (
        <TouchableOpacity 
            style={styles.moodOptionContainer} 
            onPress={onPress}
        >
            <View style={[
                styles.moodCircle, 
                isSelected && styles.selectedMoodCircle
            ]}>
                {/* Add an icon here later if needed */}
            </View>
            <Text style={styles.moodLabel}>{mood}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <Header />
            <Text style={styles.title}>What's your mood?</Text>
            
            <View style={styles.moodOptionContainer}>
                    <MoodOption 
                        mood="Anxious"
                        isSelected={selectedMood === 'Anxious'}
                        onPress={() => setSelectedMood('Anxious')}
                    />
                    <MoodOption 
                        mood="Distracted"
                        isSelected={selectedMood === 'Distracted'}
                        onPress={() => setSelectedMood('Distracted')}
                    />
                    <MoodOption 
                        mood="Sleepy"
                        isSelected={selectedMood === 'Sleepy'}
                        onPress={() => setSelectedMood('Sleepy')}
                    />
                </View>
        </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '500',
        color: '#1F2937',
        lineHeight: 38,
    },
    moodOptionContainer: {
        alignItems: 'center',
    },
    moodCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f0f0',
        marginBottom: 8,
    },
    selectedMoodCircle: {
        backgroundColor: '#8B5CF6',
    },
    moodLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default SelectMood;