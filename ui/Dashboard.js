import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Header from './Header'; // Adjust the import path based on your file structure

const Dashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {/* Add your other dashboard content here */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default Dashboard;