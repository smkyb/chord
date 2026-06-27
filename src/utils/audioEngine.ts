import * as Tone from 'tone';

export type InstrumentType = 'Synth' | 'FMSynth' | 'AMSynth';

class AudioEngine {
  private polySynth: Tone.PolySynth | null = null;
  private currentInstrument: InstrumentType = 'FMSynth';
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    await Tone.start();
    this.setupInstrument(this.currentInstrument);
    this.isInitialized = true;
  }

  setInstrument(type: InstrumentType) {
    this.currentInstrument = type;
    if (this.isInitialized) {
      this.setupInstrument(type);
    }
  }

  private setupInstrument(type: InstrumentType) {
    // Dispose previous synth if exists
    if (this.polySynth) {
      this.polySynth.dispose();
    }

    let synthClass: any;
    let options: any = {
      volume: -12, // Reduce volume to prevent clipping when playing chords
    };

    switch (type) {
      case 'Synth':
        synthClass = Tone.Synth;
        options = {
          ...options,
          oscillator: { type: 'triangle8' },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 1.5 }
        };
        break;
      case 'FMSynth':
        synthClass = Tone.FMSynth;
        options = {
          ...options,
          harmonicity: 3,
          modulationIndex: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 2 },
          modulation: { type: 'square' },
          modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 1.5 }
        };
        break;
      case 'AMSynth':
        synthClass = Tone.AMSynth;
        options = {
          ...options,
          harmonicity: 2.5,
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1.5 },
          modulation: { type: 'square' },
          modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1.5 }
        };
        break;
    }

    this.polySynth = new Tone.PolySynth(synthClass, options).toDestination();
  }

  playChord(notes: string[], duration: string = '2n') {
    if (!this.isInitialized || !this.polySynth) return;
    
    // Release any currently playing notes
    this.polySynth.releaseAll();
    
    // Play the new chord
    this.polySynth.triggerAttackRelease(notes, duration);
  }

  stopAll() {
    if (this.polySynth) {
      this.polySynth.releaseAll();
    }
  }
}

export const audioEngine = new AudioEngine();
