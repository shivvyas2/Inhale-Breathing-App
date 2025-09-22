import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './Header';
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../supabase';

const SelectMood = ({ navigation }) => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const MoodOption = ({ mood, emoji, description, isSelected, onPress }) => (
        <TouchableOpacity 
            style={styles.moodOptionContainer} 
            onPress={onPress}
        >
            <View style={[
                styles.moodCircle, 
                isSelected && styles.selectedMoodCircle
            ]}>
                <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <Text style={styles.moodLabel}>{mood}</Text>
            <Text style={styles.moodDescription}>{description}</Text>
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
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.container}>
            <Header />
            <Text style={styles.title}>What's your mood?</Text>
            
            <View style={styles.moodOptionsContainer}>
                    <MoodOption 
                        mood="Anxiety Relief"
                        emoji="🕯️"
                        description="Calming music to ease anxiety"
                        isSelected={selectedMood === 'Anxiety Relief'}
                        onPress={() => handleMoodSelect('Anxiety Relief')}
                    />
                    <MoodOption 
                        mood="Meditate"
                        emoji="🧘"
                        description="Deep meditation music"
                        isSelected={selectedMood === 'Meditate'}
                        onPress={() => handleMoodSelect('Meditate')}
                    />
                    <MoodOption 
                        mood="Wind Down"
                        emoji="🌙"
                        description="Relaxing bedtime music"
                        isSelected={selectedMood === 'Wind Down'}
                        onPress={() => handleMoodSelect('Wind Down')}
                    />
                    <MoodOption 
                        mood="Focus"
                        emoji="🎯"
                        description="Concentration music"
                        isSelected={selectedMood === 'Focus'}
                        onPress={() => handleMoodSelect('Focus')}
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
        width: '45%',
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    moodCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f0f0',
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedMoodCircle: {
        backgroundColor: '#8B5CF6',
    },
    emoji: {
        fontSize: 32,
    },
    moodLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
        textAlign: 'center',
    },
    moodDescription: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default SelectMood;