export type Note = 'C' | 'C#' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export const NOTES: Note[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export interface ChordDefinition {
  name: string;
  intervals: number[]; // semitones from root
}

export interface ChordGroup {
  category: string;
  chords: ChordDefinition[];
}

export const CHORD_GROUPS: ChordGroup[] = [
  {
    category: 'Triads (3和音)',
    chords: [
      { name: 'Major', intervals: [0, 4, 7] },
      { name: 'Minor (m)', intervals: [0, 3, 7] },
      { name: 'Augmented (aug)', intervals: [0, 4, 8] },
      { name: 'Diminished (dim)', intervals: [0, 3, 6] },
      { name: 'Sus2', intervals: [0, 2, 7] },
      { name: 'Sus4', intervals: [0, 5, 7] },
    ]
  },
  {
    category: '6ths (シックスス)',
    chords: [
      { name: '6th (6)', intervals: [0, 4, 7, 9] },
      { name: 'Minor 6th (m6)', intervals: [0, 3, 7, 9] },
      { name: '6/9', intervals: [0, 4, 7, 9, 14] },
    ]
  },
  {
    category: '7ths (セブンス)',
    chords: [
      { name: 'Major 7th (maj7)', intervals: [0, 4, 7, 11] },
      { name: 'Minor 7th (m7)', intervals: [0, 3, 7, 10] },
      { name: 'Dominant 7th (7)', intervals: [0, 4, 7, 10] },
      { name: 'Diminished 7th (dim7)', intervals: [0, 3, 6, 9] },
      { name: 'Half Diminished (m7b5)', intervals: [0, 3, 6, 10] },
      { name: 'Minor Major 7th (mM7)', intervals: [0, 3, 7, 11] },
      { name: 'Augmented Major 7th (augM7)', intervals: [0, 4, 8, 11] },
      { name: 'Augmented 7th (aug7)', intervals: [0, 4, 8, 10] },
      { name: '7sus4', intervals: [0, 5, 7, 10] },
    ]
  },
  {
    category: '9ths (ナインス)',
    chords: [
      { name: '9th (9)', intervals: [0, 4, 7, 10, 14] },
      { name: 'Major 9th (maj9)', intervals: [0, 4, 7, 11, 14] },
      { name: 'Minor 9th (m9)', intervals: [0, 3, 7, 10, 14] },
      { name: 'Add9 (add9)', intervals: [0, 4, 7, 14] },
      { name: 'Minor Add9 (madd9)', intervals: [0, 3, 7, 14] },
    ]
  },
  {
    category: '11ths & 13ths',
    chords: [
      { name: '11th (11)', intervals: [0, 4, 7, 10, 14, 17] },
      { name: 'Major 11th (maj11)', intervals: [0, 4, 7, 11, 14, 17] },
      { name: 'Minor 11th (m11)', intervals: [0, 3, 7, 10, 14, 17] },
      { name: '13th (13)', intervals: [0, 4, 7, 10, 14, 21] },
      { name: 'Major 13th (maj13)', intervals: [0, 4, 7, 11, 14, 21] },
      { name: 'Minor 13th (m13)', intervals: [0, 3, 7, 10, 14, 21] },
    ]
  },
  {
    category: 'Altered (オルタード)',
    chords: [
      { name: '7b5', intervals: [0, 4, 6, 10] },
      { name: '7b9', intervals: [0, 4, 7, 10, 13] },
      { name: '7#9', intervals: [0, 4, 7, 10, 15] },
      { name: '7#11', intervals: [0, 4, 7, 10, 18] },
      { name: '7b13', intervals: [0, 4, 7, 10, 20] },
      { name: 'maj7#11', intervals: [0, 4, 7, 11, 18] },
    ]
  }
];

export function getChordNotes(root: Note, chord: ChordDefinition, octave: number = 4): string[] {
  const rootIndex = NOTES.indexOf(root);
  return chord.intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    const noteOctave = octave + Math.floor((rootIndex + interval) / 12);
    return `${NOTES[noteIndex]}${noteOctave}`;
  });
}

export interface DetectedChord {
  root: Note;
  chord: ChordDefinition;
}

export function detectChords(selectedNotes: Note[]): DetectedChord[] {
  if (selectedNotes.length === 0) return [];

  const detected: DetectedChord[] = [];
  const uniqueSelectedNotes = Array.from(new Set(selectedNotes));

  // Check every selected note as a potential root
  for (const potentialRoot of uniqueSelectedNotes) {
    const rootIndex = NOTES.indexOf(potentialRoot);

    // Calculate intervals relative to the potential root (modulo 12)
    const intervals = uniqueSelectedNotes.map(note => {
      const noteIndex = NOTES.indexOf(note);
      let interval = noteIndex - rootIndex;
      if (interval < 0) interval += 12;
      return interval;
    });

    // Sort intervals to match the definition style
    intervals.sort((a, b) => a - b);

    // Special case for some chords that might have > 1 octave (e.g. 9th, 11th, 13th)
    // Our CHORD_GROUPS intervals use 14 for a 9th (instead of 2).
    // So we need to match the "modulo 12" set of intervals.
    // Let's create a normalized version of intervals for all defined chords.
    
    for (const group of CHORD_GROUPS) {
      for (const chord of group.chords) {
        // Normalize the chord's defined intervals (modulo 12 and sorted unique)
        const chordIntervalsMod12 = Array.from(new Set(chord.intervals.map(i => i % 12))).sort((a, b) => a - b);
        
        // Compare arrays
        if (intervals.length === chordIntervalsMod12.length && 
            intervals.every((val, index) => val === chordIntervalsMod12[index])) {
          detected.push({ root: potentialRoot, chord });
        }
      }
    }
  }

  return detected;
}
