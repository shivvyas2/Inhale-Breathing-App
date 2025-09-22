import { Haptics } from 'expo-haptics';
import { Audio } from 'expo-av';

export class AdaptiveBreathingGuide {
  constructor() {
    this.isGuiding = false;
    this.currentPhase = 'inhale';
    this.phaseStartTime = null;
    this.breathingPattern = { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
    this.phaseIndex = 0;
    this.phases = ['inhale', 'hold1', 'exhale', 'hold2'];
    this.callbacks = {
      onPhaseChange: null,
      onSessionComplete: null,
      onAnxietyReduction: null
    };
    this.sessionStartTime = null;
    this.anxietyReductionTarget = 0.3; // Target anxiety level
  }

  // Start adaptive breathing session
  async startSession(initialPattern, targetAnxietyReduction = 0.3) {
    try {
      console.log('🫁 Starting adaptive breathing session...');
      
      this.breathingPattern = initialPattern;
      this.anxietyReductionTarget = targetAnxietyReduction;
      this.isGuiding = true;
      this.phaseIndex = 0;
      this.currentPhase = this.phases[0];
      this.sessionStartTime = Date.now();
      this.phaseStartTime = Date.now();

      // Start the breathing cycle
      this.startBreathingCycle();
      
      console.log('✅ Adaptive breathing session started');
    } catch (error) {
      console.error('❌ Failed to start breathing session:', error);
      throw error;
    }
  }

  // Stop breathing session
  stopSession() {
    console.log('🫁 Stopping breathing session...');
    this.isGuiding = false;
    this.phaseIndex = 0;
    this.currentPhase = 'inhale';
  }

  // Start the breathing cycle
  startBreathingCycle() {
    if (!this.isGuiding) return;

    this.phaseStartTime = Date.now();
    const phaseDuration = this.getPhaseDuration() * 1000; // Convert to milliseconds

    // Trigger haptic feedback for phase start
    this.triggerPhaseHaptic();

    // Notify phase change
    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange({
        phase: this.currentPhase,
        duration: this.getPhaseDuration(),
        progress: 0,
        phaseIndex: this.phaseIndex
      });
    }

    // Set up phase completion
    setTimeout(() => {
      if (this.isGuiding) {
        this.completePhase();
      }
    }, phaseDuration);
  }

  // Complete current phase and move to next
  completePhase() {
    if (!this.isGuiding) return;

    // Move to next phase
    this.phaseIndex = (this.phaseIndex + 1) % this.phases.length;
    this.currentPhase = this.phases[this.phaseIndex];

    // If we completed a full cycle, check for session completion
    if (this.phaseIndex === 0) {
      this.checkSessionCompletion();
    }

    // Start next phase
    this.startBreathingCycle();
  }

  // Get duration for current phase
  getPhaseDuration() {
    return this.breathingPattern[this.currentPhase] || 4;
  }

  // Get current phase progress (0-1)
  getPhaseProgress() {
    if (!this.phaseStartTime) return 0;
    
    const elapsed = Date.now() - this.phaseStartTime;
    const duration = this.getPhaseDuration() * 1000;
    
    return Math.min(1, elapsed / duration);
  }

  // Trigger haptic feedback for current phase
  async triggerPhaseHaptic() {
    try {
      switch (this.currentPhase) {
        case 'inhale':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'hold1':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'exhale':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'hold2':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
      }
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }

  // Check if session should be completed
  checkSessionCompletion() {
    if (!this.sessionStartTime) return;

    const sessionDuration = (Date.now() - this.sessionStartTime) / 1000; // in seconds
    const targetDuration = 300; // 5 minutes default

    if (sessionDuration >= targetDuration) {
      this.completeSession();
    }
  }

  // Complete the breathing session
  completeSession() {
    console.log('🎉 Breathing session completed!');
    this.isGuiding = false;
    
    if (this.callbacks.onSessionComplete) {
      this.callbacks.onSessionComplete({
        duration: (Date.now() - this.sessionStartTime) / 1000,
        pattern: this.breathingPattern
      });
    }
  }

  // Update breathing pattern based on heart rate feedback
  updatePattern(newPattern) {
    console.log('🔄 Updating breathing pattern:', newPattern);
    this.breathingPattern = { ...this.breathingPattern, ...newPattern };
  }

  // Get current session status
  getSessionStatus() {
    return {
      isGuiding: this.isGuiding,
      currentPhase: this.currentPhase,
      phaseProgress: this.getPhaseProgress(),
      phaseDuration: this.getPhaseDuration(),
      pattern: this.breathingPattern,
      sessionDuration: this.sessionStartTime ? (Date.now() - this.sessionStartTime) / 1000 : 0
    };
  }

  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get breathing guidance text
  getGuidanceText() {
    const progress = this.getPhaseProgress();
    
    switch (this.currentPhase) {
      case 'inhale':
        return progress < 0.5 ? 'Breathe in slowly...' : 'Keep inhaling...';
      case 'hold1':
        return progress < 0.5 ? 'Hold your breath...' : 'Keep holding...';
      case 'exhale':
        return progress < 0.5 ? 'Breathe out slowly...' : 'Keep exhaling...';
      case 'hold2':
        return progress < 0.5 ? 'Pause and rest...' : 'Almost ready...';
      default:
        return 'Focus on your breath...';
    }
  }

  // Get visual breathing guide (for watch face)
  getVisualGuide() {
    const progress = this.getPhaseProgress();
    const phase = this.currentPhase;
    
    // Create a simple visual representation
    const maxSize = 20;
    const currentSize = Math.round(maxSize * progress);
    
    let visual = '';
    for (let i = 0; i < maxSize; i++) {
      if (i < currentSize) {
        visual += '●';
      } else {
        visual += '○';
      }
    }
    
    return {
      visual,
      phase,
      progress: Math.round(progress * 100)
    };
  }
}
