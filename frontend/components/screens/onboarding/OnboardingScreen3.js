import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function OnboardingScreen3({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text>✕</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Unleash Your Inner Calm</Text>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Let's Go!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4E157',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    opacity: 0.5,
  },
  activeDot: {
    opacity: 1,
    backgroundColor: '#FFC107',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

