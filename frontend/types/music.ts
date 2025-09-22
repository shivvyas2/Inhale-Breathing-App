export enum BreathingType {
  BOX_BREATHING = 'Box Breathing',
  FOUR_SEVEN_EIGHT = '4-7-8 Breathing',
  DEEP_RELAXATION = 'Deep Relaxation',
  ANXIOUS = 'Anxiety Relief',
  MEDITATE = 'Meditate',
  WIND_DOWN = 'Wind Down',
  FOCUS = 'Focus',
}

export interface BreathingOption {
  value: BreathingType;
  label: string;
  description: string;
}

export interface MusicParams {
  description: string;
  baseFrequency: number;
  droneHarmonics: number[];
  lfoRate: number;
  filterCutoff: number;
  attackTime: number;
  releaseTime: number;
  oceanVolume: number;
}
