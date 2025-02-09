import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ChooseSound = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Sleep', 'Reading', 'Calm', 'Focus', 'Meditation', 'Nature'];

  const musicData = {
    All: [
      { id: 1, title: 'Lost', duration: '30:30', image: require('../../assets/images/lost.png') },
      { id: 2, title: 'Discover', duration: '30:30', image: require('../../assets/images/discover.png') },
      { id: 3, title: 'Journey', duration: '30:30', image: require('../../assets/images/journey.png') },
      { id: 4, title: 'Joyful', duration: '30:30', image: require('../../assets/images/joyful.png') },
    ],
    Sleep: [
      { id: 5, title: 'Dreamland', duration: '45:00', image: require('../../assets/images/lost.png') },
      { id: 6, title: 'Night Peace', duration: '30:00', image: require('../../assets/images/discover.png') },
      { id: 7, title: 'Lullaby', duration: '25:00', image: require('../../assets/images/journey.png') },
      { id: 8, title: 'Sweet Dreams', duration: '35:00', image: require('../../assets/images/joyful.png') },
    ],
    // ... other category data remains the same
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <MaterialCommunityIcons name="fire" size={24} color="#8B5CF6" />
          <Text style={styles.pointsText}>29</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Choose soundtrack</Text>

      {/* Scrollable Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Music Grid */}
      <ScrollView style={styles.gridContainer}>
        <View style={styles.grid}>
          {musicData[activeTab]?.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              <View style={styles.musicCover}>
                <Image source={item.image} style={styles.coverImage} />
                <View style={styles.musicIcon}>
                  <MaterialCommunityIcons name="music" size={20} color="#FFF" />
                </View>
              </View>
              <Text style={styles.duration}>{item.duration}</Text>
              <Text style={styles.musicTitle}>{item.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tabsScrollContainer: {
    paddingHorizontal: 24,
    gap: 12,
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 24,
    alignItems: 'center',
  },
  musicCover: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  musicIcon: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 20,
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  musicTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 24,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChooseSound;