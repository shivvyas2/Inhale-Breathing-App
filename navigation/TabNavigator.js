import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../components/screens/Dashboard';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#D1D5DB',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 70,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabItem}>
              <Ionicons name="home" size={24} color={color} />
              {focused && <View style={styles.indicator} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabItem}>
              <Ionicons name="calendar-clear" size={24} color={color} />
              {focused && <View style={styles.indicator} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabItem}>
              <Ionicons name="heart" size={24} color={color} />
              {focused && <View style={styles.indicator} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  indicator: {
    width: 4,
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginTop: 4,
  },
});

export default TabNavigator;