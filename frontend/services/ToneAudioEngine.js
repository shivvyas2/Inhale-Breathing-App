// Tone-based ambient audio engine for Expo Web.
// This engine is only intended for the web target where Tone.js runs.

let Tone = null;

// Lightweight AudioService (adapted from the provided snippet) without TS types
class AudioService {
  constructor() {
    this.isInitialized = false;
    this.channels = {
      pads: null,
      drones: null,
      ocean: null,
    };
    this.padSynth = null;
    this.droneOscs = [];
    this.oceanNoise = null;
    this.oceanFilter = null;
  }

  async init(initialVolumes) {
    if (this.isInitialized) return;

    // Start with the master output muted. It will be faded in on play.
    Tone.getDestination().volume.value = -Infinity;

    // Create a dedicated volume control for each sound layer.
    this.channels.pads = new Tone.Volume(Tone.gainToDb(initialVolumes.pads)).toDestination();
    this.channels.drones = new Tone.Volume(Tone.gainToDb(initialVolumes.drones)).toDestination();
    this.channels.ocean = new Tone.Volume(Tone.gainToDb(initialVolumes.ocean)).toDestination();

    // Pads
    const padReverb = new Tone.Freeverb(0.7, 3000).connect(this.channels.pads);
    const padFilter = new Tone.Filter(800, 'lowpass').connect(padReverb);
    this.padSynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1.5,
      modulationIndex: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 4, decay: 1, sustain: 1, release: 4 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 1, decay: 0, sustain: 1, release: 1 },
    }).connect(padFilter);
    this.padSynth.volume.value = -12;

    // Drones
    this.droneOscs = [
      new Tone.FatOscillator('C1', 'sine', 40).connect(this.channels.drones),
      new Tone.FatOscillator('G1', 'sine', 40).connect(this.channels.drones),
    ];
    this.droneOscs.forEach((osc) => {
      osc.volume.value = -6;
    });

    // Ocean
    this.oceanFilter = new Tone.AutoFilter({
      frequency: 0.15,
      baseFrequency: 400,
      octaves: 4,
    }).connect(this.channels.ocean);
    this.oceanNoise = new Tone.Noise('brown').connect(this.oceanFilter);
    this.oceanNoise.volume.value = -10;

    this.isInitialized = true;
  }

  async start() {
    if (!this.isInitialized) return;
    await Tone.start();
    Tone.Transport.start();
    this.padSynth && this.padSynth.triggerAttack(['C2', 'G2', 'C3']);
    this.droneOscs.forEach((osc) => osc.start());
    this.oceanNoise && this.oceanNoise.start();
    this.oceanFilter && this.oceanFilter.start();
    Tone.getDestination().volume.rampTo(0, 1.0);
  }

  stop() {
    if (!this.isInitialized) return;
    Tone.getDestination().volume.rampTo(-Infinity, 1.0);
    Tone.Transport.scheduleOnce(() => {
      if (this.padSynth && this.padSynth.releaseAll) this.padSynth.releaseAll();
      this.droneOscs.forEach((osc) => osc.stop());
      this.oceanNoise && this.oceanNoise.stop();
      this.oceanFilter && this.oceanFilter.stop();
    }, Tone.now() + 1.1);
  }

  setVolume(channel, volume) {
    if (!this.isInitialized || !this.channels[channel]) return;
    const db = volume === 0 ? -Infinity : Tone.gainToDb(volume);
    this.channels[channel].volume.rampTo(db, 0.1);
  }
}

export class ToneAudioEngine {
  constructor() {
    this.service = null;
    this.isInitialized = false;
    this.isPlaying = false;
  }

  async setup(params) {
    if (!Tone) {
      // Dynamic import so native bundles are unaffected
      const mod = await import('tone');
      Tone = mod;
    }
    // Map AI params to initial volumes (0..1)
    const padsVol = 0.6;
    const dronesVol = 0.5;
    const oceanVol = Math.max(0, Math.min(1, params?.oceanVolume ?? 0.05));

    this.service = new AudioService();
    await this.service.init({ pads: padsVol, drones: dronesVol, ocean: oceanVol });
    this.isInitialized = true;
  }

  async play() {
    if (!this.isInitialized || !this.service) return;
    await this.service.start();
    this.isPlaying = true;
  }

  async stop() {
    if (!this.isInitialized || !this.service) return;
    this.service.stop();
    this.isPlaying = false;
  }

  setChannelVolume(channel, volume) {
    if (!this.service) return;
    this.service.setVolume(channel, volume);
  }

  getPlayingState() {
    return { isPlaying: this.isPlaying, isInitialized: this.isInitialized };
  }

  async cleanup() {
    try {
      await this.stop();
    } catch {}
    this.service = null;
    this.isInitialized = false;
  }
}

export default ToneAudioEngine;


