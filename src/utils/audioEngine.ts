import * as Tone from 'tone';

export type InstrumentType = 'Piano' | 'Synth' | 'FMSynth' | 'AMSynth';

class AudioEngine {
  private instrument: Tone.PolySynth | Tone.Sampler | null = null;
  private currentInstrument: InstrumentType = 'Piano'; // Default to Piano
  private isInitialized = false;
  
  // Callback for UI to show loading state
  public onLoadStateChange: (isLoading: boolean) => void = () => {};

  async initialize() {
    if (this.isInitialized) return;
    await Tone.start();
    this.setupInstrument(this.currentInstrument);
    this.isInitialized = true;
  }

  setInstrument(type: InstrumentType) {
    if (this.currentInstrument === type && this.instrument) return;
    this.currentInstrument = type;
    if (this.isInitialized) {
      this.setupInstrument(type);
    }
  }

  private setupInstrument(type: InstrumentType) {
    // Notify UI that we are starting to load/setup
    this.onLoadStateChange(true);

    // Dispose previous instrument if exists
    if (this.instrument) {
      this.instrument.dispose();
      this.instrument = null;
    }

    if (type === 'Piano') {
      // Use Salamander Grand Piano samples
      this.instrument = new Tone.Sampler({
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          A6: "A6.mp3",
          C7: "C7.mp3",
          "D#7": "Ds7.mp3",
          "F#7": "Fs7.mp3",
          A7: "A7.mp3",
          C8: "C8.mp3"
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        release: 1,
        onload: () => {
          this.onLoadStateChange(false);
        }
      }).toDestination();
      
      // Tone.Sampler's volume can be adjusted directly
      this.instrument.volume.value = -5; 
    } else {
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

      this.instrument = new Tone.PolySynth(synthClass, options).toDestination();
      // Synth initialization is synchronous
      this.onLoadStateChange(false);
    }
  }

  playChord(notes: string[], duration: string = '2n') {
    if (!this.isInitialized || !this.instrument) return;
    
    // Release any currently playing notes
    this.instrument.releaseAll();
    
    // Play the new chord
    this.instrument.triggerAttackRelease(notes, duration);
  }

  stopAll() {
    if (this.instrument) {
      this.instrument.releaseAll();
    }
  }
}

export const audioEngine = new AudioEngine();
