import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../supabase';

const getPrompt = (breathingType) => {
  return `
    You are an expert ambient music composer specializing in soundscapes for meditation and wellness, with a deep understanding of audio synthesis parameters.
    Your task is to generate parameters for a piece of music designed for "${breathingType}" breathing.
    The sound should be composed of soft, evolving ambient synth pads and gentle ocean wave sounds.

    Generate two things:
    1. A detailed, evocative 'description' for the user, under 80 words.
    2. A JSON object with precise audio parameters for a web audio synthesizer.

    Parameter Guidelines:
    - baseFrequency: A low, calming root note. (e.g., between 80 and 150 Hz).
    - droneHarmonics: An array of multipliers for the base frequency to create a rich chord. Use simple, consonant intervals (e.g., [1, 1.5, 2, 2.5] for root, fifth, octave, major third).
    - lfoRate: A very slow rate for a Low-Frequency Oscillator to modulate the filter, creating a gentle sweeping/pulsing effect (e.g., between 0.05 and 0.2 Hz).
    - filterCutoff: The base cutoff frequency for a low-pass filter to control brightness. Lower is softer. (e.g., between 300 and 1000 Hz).
    - attackTime: A long attack for a soft entry (e.g., between 8 and 15 seconds).
    - releaseTime: A long release for a gentle fade-out (e.g., between 8 and 15 seconds).
    - oceanVolume: The volume of the background ocean wave noise. Use 0 to disable, or a small value like 0.05 for subtlety.

    The overall mood should be serene, grounding, and conducive to deep, rhythmic breathing.
    For "${breathingType}", tailor the parameters to reflect its goal. For example, Box Breathing might have a more stable, structured sound, while Deep Relaxation might be more fluid and ethereal.
  `;
};

const responseSchema = {
  type: "object",
  properties: {
    description: {
      type: "string",
      description: "A detailed, evocative description for the user."
    },
    baseFrequency: {
      type: "number",
      description: "The base frequency of the drone in Hz."
    },
    droneHarmonics: {
      type: "array",
      items: { type: "number" },
      description: "An array of multipliers for the base frequency to create a chord."
    },
    lfoRate: {
      type: "number",
      description: "The speed of the LFO in Hz for filter modulation."
    },
    filterCutoff: {
      type: "number",
      description: "The base cutoff frequency for the low-pass filter in Hz."
    },
    attackTime: {
      type: "number",
      description: "The attack time in seconds for the main volume envelope."
    },
    releaseTime: {
      type: "number",
      description: "The release time in seconds for the main volume envelope."
    },
    oceanVolume: {
      type: "number",
      description: "The volume of the ocean waves (0.0 to 0.1)."
    },
  },
  required: [
    "description", "baseFrequency", "droneHarmonics", "lfoRate", 
    "filterCutoff", "attackTime", "releaseTime", "oceanVolume"
  ],
};

export const generateMusicParams = async (breathingType) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found');
    }

    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = getPrompt(breathingType);
    
    const result = await model.generateContent([
      {
        text: prompt
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    console.log('🎵 Raw Gemini response:', text);
    
    // Clean the response text
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Extract JSON from the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response. Full response:', text);
      throw new Error('No JSON found in response');
    }
    
    let jsonText = jsonMatch[0];
    console.log('🎵 Extracted JSON:', jsonText);
    
    // Remove comments from JSON (both // and /* */ style)
    jsonText = jsonText
      .replace(/\/\/.*$/gm, '') // Remove // comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/(\d+\.?\d*)\s+"/g, '$1, "') // Add missing commas before quoted keys
      .replace(/(\d+\.?\d*)\s+}/g, '$1}') // Remove extra spaces before closing braces
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .trim();
    
    console.log('🎵 Cleaned JSON:', jsonText);
    
    let musicParams;
    try {
      musicParams = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Problematic JSON:', jsonText);
      throw new Error(`JSON parse error: ${parseError.message}`);
    }
    
    console.log('🎵 Generated music parameters:', musicParams);
    return musicParams;
    
  } catch (error) {
    console.error('Error generating music parameters:', error);
    
    // Return fallback parameters if AI fails
    console.log('🎵 Using fallback music parameters');
    return getFallbackMusicParams(breathingType);
  }
}

// Fallback music parameters when AI fails
function getFallbackMusicParams(breathingType) {
  const fallbackParams = {
    'Anxiety Relief': {
      description: 'A calming ambient soundscape with gentle waves and soft harmonic drones to help ease anxiety and promote relaxation.',
      baseFrequency: 80,
      droneHarmonics: [1, 1.5, 2, 2.5],
      lfoRate: 0.1,
      filterCutoff: 600,
      attackTime: 1,
      releaseTime: 1,
      oceanVolume: 0.05
    },
    'Meditate': {
      description: 'A deep meditative ambient with nature sounds and minimal percussion, perfect for focused meditation practice.',
      baseFrequency: 60,
      droneHarmonics: [1, 2, 3, 4],
      lfoRate: 0.05,
      filterCutoff: 400,
      attackTime: 1,
      releaseTime: 1,
      oceanVolume: 0.08
    },
    'Wind Down': {
      description: 'Relaxing ambient with soft arpeggios and gentle reverb, designed to help you unwind and prepare for rest.',
      baseFrequency: 100,
      droneHarmonics: [1, 1.25, 1.5, 2],
      lfoRate: 0.08,
      filterCutoff: 500,
      attackTime: 1,
      releaseTime: 1,
      oceanVolume: 0.03
    },
    'Focus': {
      description: 'Concentrated ambient with subtle rhythms and clear frequencies to enhance focus and mental clarity.',
      baseFrequency: 120,
      droneHarmonics: [1, 1.33, 2, 2.67],
      lfoRate: 0.12,
      filterCutoff: 800,
      attackTime: 1,
      releaseTime: 1,
      oceanVolume: 0.02
    }
  };
  
  return fallbackParams[breathingType] || fallbackParams['Meditate'];
};
