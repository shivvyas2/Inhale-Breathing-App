import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import Header from './Header';
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../supabase';

const SelectMood = ({ navigation }) => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

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

    const handleMoodSelect = async (mood) => {
        setSelectedMood(mood);
        
        try {
            setLoading(true);
            
            // Save mood selection to Supabase if user is logged in
            if (user) {
                await db.updateUserProfile(user.id, { 
                    current_mood: mood,
                    updated_at: new Date().toISOString()
                });
            }
            
            // Navigate to next screen after a short delay
            setTimeout(() => {
                navigation.navigate('ChooseSound');
            }, 500);
            
        } catch (error) {
            console.error('Error saving mood:', error);
            // Still navigate even if save fails
            navigation.navigate('ChooseSound');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <Header />
            <Text style={styles.title}>What's your mood?</Text>
            
            <View style={styles.moodOptionsContainer}>
                    <MoodOption 
                        mood="Anxious"
                        isSelected={selectedMood === 'Anxious'}
                        onPress={() => handleMoodSelect('Anxious')}
                    />
                    <MoodOption 
                        mood="Distracted"
                        isSelected={selectedMood === 'Distracted'}
                        onPress={() => handleMoodSelect('Distracted')}
                    />
                    <MoodOption 
                        mood="Sleepy"
                        isSelected={selectedMood === 'Sleepy'}
                        onPress={() => handleMoodSelect('Sleepy')}
                    />
                    <MoodOption 
                        mood="Stressed"
                        isSelected={selectedMood === 'Stressed'}
                        onPress={() => handleMoodSelect('Stressed')}
                    />
                    <MoodOption 
                        mood="Calm"
                        isSelected={selectedMood === 'Calm'}
                        onPress={() => handleMoodSelect('Calm')}
                    />
                    <MoodOption 
                        mood="Focused"
                        isSelected={selectedMood === 'Focused'}
                        onPress={() => handleMoodSelect('Focused')}
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
    moodOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    moodOptionContainer: {
        alignItems: 'center',
        width: '30%',
        marginBottom: 20,
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