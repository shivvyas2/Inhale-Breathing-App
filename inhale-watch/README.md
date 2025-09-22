# Inhale Watch - Apple Watch Heart Rate Guided Breathing

A companion Apple Watch app that monitors your heart rate in real-time and provides adaptive breathing exercises to help manage anxiety and stress.

## Features

### ❤️ Real-Time Heart Rate Monitoring
- Continuous heart rate tracking using Apple Watch sensors
- Baseline heart rate establishment for personalized anxiety detection
- Real-time anxiety level calculation based on heart rate patterns

### 🫁 Adaptive Breathing Exercises
- Dynamic breathing patterns that adjust based on your current heart rate
- Real-time guidance with haptic feedback
- Visual breathing guides optimized for Apple Watch display
- Automatic pattern adjustment as anxiety levels change

### 🧠 Anxiety Detection & Management
- Intelligent anxiety detection using heart rate variability
- Automatic breathing exercise suggestions when anxiety is detected
- Progress tracking and session completion notifications
- Calm state detection and positive reinforcement

## How It Works

1. **Heart Rate Monitoring**: The app continuously monitors your heart rate using the Apple Watch's built-in sensors
2. **Anxiety Detection**: When your heart rate exceeds your baseline by a significant amount, the app detects potential anxiety
3. **Adaptive Breathing**: The app suggests and guides you through breathing exercises tailored to your current anxiety level
4. **Real-Time Adjustment**: As your heart rate changes during the exercise, the breathing pattern adjusts accordingly

## Breathing Patterns

The app uses different breathing patterns based on your anxiety level:

- **High Anxiety** (Heart rate > 100 BPM): 6-6-8-2 pattern (slow, deep breathing)
- **Moderate Anxiety** (Heart rate 80-100 BPM): 5-4-6-3 pattern (moderate breathing)
- **Low Anxiety** (Heart rate 70-80 BPM): 4-4-4-4 pattern (normal breathing)
- **Calm** (Heart rate < 70 BPM): 3-3-3-3 pattern (gentle breathing)

## Setup Instructions

### Prerequisites
- Apple Watch (Series 4 or later recommended)
- iPhone with iOS 14.0 or later
- Xcode 12.0 or later
- Apple Developer Account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inhale-watch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Apple Watch**
   - Open the project in Xcode
   - Add your Apple Developer Team ID
   - Configure the WatchKit extension target
   - Set up HealthKit capabilities

4. **Build and run**
   ```bash
   npm run ios
   ```

### HealthKit Integration

To enable real heart rate monitoring, you'll need to:

1. **Add HealthKit capability** in Xcode
2. **Request permissions** for heart rate data
3. **Replace the simulation** in `HeartRateMonitor.js` with actual HealthKit queries

Example HealthKit integration:
```javascript
import { HealthKit } from 'expo-health-kit';

// Request heart rate permissions
const requestHeartRatePermission = async () => {
  const granted = await HealthKit.requestPermissionsAsync({
    permissions: ['heartRate']
  });
  return granted.heartRate;
};

// Query heart rate data
const getHeartRate = async () => {
  const heartRate = await HealthKit.getHeartRateSamplesAsync({
    startDate: new Date(Date.now() - 60000), // Last minute
    endDate: new Date(),
    limit: 1
  });
  return heartRate[0]?.value;
};
```

## Development

### Project Structure
```
inhale-watch/
├── services/
│   ├── HeartRateMonitor.js      # Heart rate monitoring and anxiety detection
│   └── AdaptiveBreathingGuide.js # Breathing exercise guidance
├── App.tsx                      # Main Apple Watch app component
├── app.json                     # Expo configuration
└── README.md                    # This file
```

### Key Components

#### HeartRateMonitor
- Monitors heart rate in real-time
- Calculates anxiety levels based on heart rate patterns
- Maintains baseline heart rate for comparison
- Provides recommended breathing patterns

#### AdaptiveBreathingGuide
- Guides users through breathing exercises
- Provides haptic feedback for each phase
- Adjusts patterns based on real-time feedback
- Tracks session progress and completion

### Customization

#### Anxiety Thresholds
Adjust the anxiety detection sensitivity in `HeartRateMonitor.js`:
```javascript
this.anxietyThreshold = 100; // BPM threshold for anxiety detection
```

#### Breathing Patterns
Modify breathing patterns in `getRecommendedBreathingPattern()`:
```javascript
if (anxietyLevel > 0.8) {
  return { inhale: 6, hold1: 6, exhale: 8, hold2: 2 };
}
```

#### Haptic Feedback
Customize haptic patterns in `AdaptiveBreathingGuide.js`:
```javascript
case 'inhale':
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  break;
```

## Testing

### Simulator Testing
The app includes a heart rate simulation for testing without a physical Apple Watch:
- Simulates realistic heart rate patterns
- Includes occasional anxiety spikes for testing
- Adjusts patterns based on time of day

### Real Device Testing
For testing with a real Apple Watch:
1. Enable HealthKit integration
2. Grant heart rate permissions
3. Test with actual heart rate data

## Deployment

### App Store Submission
1. **Configure app identifiers** in Xcode
2. **Set up App Store Connect** listing
3. **Build and upload** using Xcode or EAS Build
4. **Submit for review** with proper health data usage descriptions

### Required App Store Information
- Health data usage descriptions
- Privacy policy for health data
- Clear explanation of heart rate monitoring purpose

## Privacy & Security

- All heart rate data is processed locally on the device
- No personal health data is transmitted to external servers
- Baseline heart rate is stored locally using AsyncStorage
- Users can clear stored data at any time

## Future Enhancements

- [ ] Integration with main Inhale app for data sync
- [ ] Advanced heart rate variability analysis
- [ ] Personalized breathing pattern learning
- [ ] Emergency contact notifications for severe anxiety
- [ ] Integration with Apple Health for comprehensive health tracking
- [ ] Voice guidance for hands-free operation
- [ ] Customizable breathing exercise library

## Support

For issues or questions:
- Check the troubleshooting section below
- Review Apple Watch development documentation
- Ensure proper HealthKit permissions are granted

## Troubleshooting

### Common Issues

1. **Heart rate not detected**
   - Ensure Apple Watch is properly paired
   - Check HealthKit permissions
   - Verify watch is snug on wrist

2. **Haptic feedback not working**
   - Check Apple Watch haptic settings
   - Ensure watch is not in silent mode
   - Test with other haptic-enabled apps

3. **App crashes on launch**
   - Check Xcode console for errors
   - Verify all dependencies are installed
   - Ensure proper iOS/watchOS version compatibility

### Debug Mode
Enable debug logging by setting:
```javascript
console.log('Debug mode enabled');
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
