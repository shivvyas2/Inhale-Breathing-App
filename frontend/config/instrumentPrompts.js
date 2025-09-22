// Dynamic Instrument Prompts System
// Similar to Lyria's instrument selection with weights

export const INSTRUMENT_PROMPTS = [
  { 
    id: 'bossa_nova', 
    name: 'Bossa Nova', 
    color: '#9900ff', 
    description: 'Smooth Brazilian jazz rhythm',
    category: 'Rhythm',
    baseWeight: 0.5,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'chillwave', 
    name: 'Chillwave', 
    color: '#5200ff', 
    description: 'Dreamy synth textures',
    category: 'Synth',
    baseWeight: 0.8,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'sparkling_arpeggios', 
    name: 'Sparkling Arpeggios', 
    color: '#d8ff3e', 
    description: 'Bright, cascading melodies',
    category: 'Melody',
    baseWeight: 0.6,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'ambient_pads', 
    name: 'Ambient Pads', 
    color: '#00d4ff', 
    description: 'Atmospheric background textures',
    category: 'Ambient',
    baseWeight: 1.2,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'soft_piano', 
    name: 'Soft Piano', 
    color: '#ff6b35', 
    description: 'Gentle, melodic piano lines',
    category: 'Piano',
    baseWeight: 0.7,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'warm_bass', 
    name: 'Warm Bass', 
    color: '#8b4513', 
    description: 'Deep, resonant bass foundation',
    category: 'Bass',
    baseWeight: 0.9,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'ethereal_voices', 
    name: 'Ethereal Voices', 
    color: '#ff69b4', 
    description: 'Soft, wordless vocal textures',
    category: 'Vocals',
    baseWeight: 0.4,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'nature_sounds', 
    name: 'Nature Sounds', 
    color: '#32cd32', 
    description: 'Ocean waves, rain, wind',
    category: 'Nature',
    baseWeight: 0.3,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'minimal_drums', 
    name: 'Minimal Drums', 
    color: '#696969', 
    description: 'Subtle, sparse percussion',
    category: 'Percussion',
    baseWeight: 0.2,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'chill_piano', 
    name: 'Chill Piano', 
    color: '#4A90E2', 
    description: 'Relaxed, mellow piano melodies',
    category: 'Piano',
    baseWeight: 1.0,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'lush_strings', 
    name: 'Lush Strings', 
    color: '#3dffab', 
    description: 'Rich, warm string sections',
    category: 'Strings',
    baseWeight: 1.0,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'warm_pads', 
    name: 'Warm Pads', 
    color: '#FF6B6B', 
    description: 'Soft, enveloping synthesizer pads',
    category: 'Synth',
    baseWeight: 1.0,
    minWeight: 0.0,
    maxWeight: 2.0
  },
  { 
    id: 'harps', 
    name: 'Harps', 
    color: '#9B59B6', 
    description: 'Ethereal, angelic harp melodies',
    category: 'Strings',
    baseWeight: 0.8,
    minWeight: 0.0,
    maxWeight: 2.0
  }
];

// Generate AI prompt based on selected instruments and weights
export const generateInstrumentPrompt = (selectedInstruments, mood, breathingPattern) => {
  const activeInstruments = selectedInstruments.filter(inst => inst.weight > 0);
  
  if (activeInstruments.length === 0) {
    return generateMoodBasedPrompt(mood, breathingPattern);
  }

  // Sort by weight (highest first)
  const sortedInstruments = activeInstruments.sort((a, b) => b.weight - a.weight);
  
  // Create weighted instrument descriptions
  const instrumentDescriptions = sortedInstruments.map(inst => {
    const intensity = getIntensityFromWeight(inst.weight);
    return `${inst.name} (${intensity})`;
  }).join(', ');

  // Generate base prompt
  const basePrompt = generateMoodBasedPrompt(mood, breathingPattern);
  
  // Add instrument-specific instructions
  const instrumentPrompt = `
    Create a ${mood.toLowerCase()} ambient music track with the following instruments:
    ${instrumentDescriptions}
    
    Focus on ${sortedInstruments[0].name.toLowerCase()} as the primary element.
    ${sortedInstruments.length > 1 ? `Support with ${sortedInstruments.slice(1).map(i => i.name.toLowerCase()).join(', ')}.` : ''}
    
    ${basePrompt}
  `;

  return instrumentPrompt.trim();
};

// Get intensity description from weight
const getIntensityFromWeight = (weight) => {
  if (weight <= 0.3) return 'subtle';
  if (weight <= 0.7) return 'moderate';
  if (weight <= 1.2) return 'prominent';
  if (weight <= 1.6) return 'strong';
  return 'dominant';
};

// Generate mood-based prompt (fallback)
const generateMoodBasedPrompt = (mood, breathingPattern) => {
  const moodPrompts = {
    'Anxiety Relief': 'Create a calming, soothing soundscape that helps reduce anxiety and promotes relaxation.',
    'Meditate': 'Generate a deep, meditative ambient track perfect for focused meditation practice.',
    'Wind Down': 'Create a gentle, peaceful atmosphere ideal for unwinding and preparing for rest.',
    'Focus': 'Generate a steady, non-distracting ambient track that enhances concentration and mental clarity.'
  };

  const breathingSpeed = getBreathingSpeed(breathingPattern);
  const basePrompt = moodPrompts[mood] || moodPrompts['Meditate'];
  
  return `${basePrompt} The music should complement a ${breathingSpeed} breathing rhythm.`;
};

// Get breathing speed from pattern
const getBreathingSpeed = (breathingPattern) => {
  if (!breathingPattern) return 'medium';
  
  const totalTime = breathingPattern.inhale + breathingPattern.hold1 + 
                   breathingPattern.exhale + breathingPattern.hold2;
  
  if (totalTime <= 8) return 'fast';
  if (totalTime <= 12) return 'medium';
  return 'slow';
};

// Get instruments by category
export const getInstrumentsByCategory = (category) => {
  return INSTRUMENT_PROMPTS.filter(inst => inst.category === category);
};

// Get all categories
export const getCategories = () => {
  const categories = [...new Set(INSTRUMENT_PROMPTS.map(inst => inst.category))];
  return categories;
};

// Default instrument selection for each mood
export const getDefaultInstrumentsForMood = (mood) => {
  const moodDefaults = {
    'Anxiety Relief': [
      { id: 'lush_strings', weight: 1.5 },
      { id: 'warm_pads', weight: 1.2 },
      { id: 'nature_sounds', weight: 0.8 },
      { id: 'ethereal_voices', weight: 0.6 }
    ],
    'Meditate': [
      { id: 'warm_pads', weight: 1.8 },
      { id: 'chill_piano', weight: 1.0 },
      { id: 'harps', weight: 0.7 },
      { id: 'nature_sounds', weight: 0.5 }
    ],
    'Wind Down': [
      { id: 'lush_strings', weight: 1.3 },
      { id: 'chill_piano', weight: 1.1 },
      { id: 'warm_bass', weight: 0.9 },
      { id: 'warm_pads', weight: 0.8 }
    ],
    'Focus': [
      { id: 'chillwave', weight: 1.4 },
      { id: 'sparkling_arpeggios', weight: 1.0 },
      { id: 'minimal_drums', weight: 0.6 },
      { id: 'warm_bass', weight: 0.8 }
    ]
  };

  return moodDefaults[mood] || moodDefaults['Meditate'];
};
