import { useState, useEffect, useCallback } from 'react';
import { Play, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { NOTES, CHORD_GROUPS, type Note, type ChordDefinition, getChordNotes } from '../utils/musicTheory';

// Generate 2 octaves of notes (C4 to B5)
const QUIZ_NOTES = [
  ...NOTES.map(note => `${note}4`),
  ...NOTES.map(note => `${note}5`)
];

export default function ChordQuiz() {
  const [currentRoot, setCurrentRoot] = useState<Note>('C');
  const [currentChord, setCurrentChord] = useState<ChordDefinition>(CHORD_GROUPS[0].chords[0]);
  const [actualNotes, setActualNotes] = useState<string[]>([]);
  
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pick a random chord that fits within the 2-octave range
  const generateNewChord = useCallback(() => {
    const validCombinations: {root: Note, chord: ChordDefinition}[] = [];
    
    for (const root of NOTES) {
      const rootIndex = NOTES.indexOf(root);
      for (const group of CHORD_GROUPS) {
        for (const chord of group.chords) {
          const maxInterval = Math.max(...chord.intervals);
          if (rootIndex + maxInterval <= 23) {
            validCombinations.push({ root, chord });
          }
        }
      }
    }
    
    const randomCombo = validCombinations[Math.floor(Math.random() * validCombinations.length)];
    
    setCurrentRoot(randomCombo.root);
    setCurrentChord(randomCombo.chord);
    setActualNotes(getChordNotes(randomCombo.root, randomCombo.chord, 4));
    
    setSelectedNotes([]);
    setIsRevealed(false);
    setIsCorrect(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    generateNewChord();
    
    audioEngine.onLoadStateChange = (loading) => {
      setIsLoading(loading);
    };

    const initAudio = () => {
      audioEngine.initialize();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, [generateNewChord]);

  const playCurrentChord = () => {
    if (isLoading) return;
    audioEngine.playChord(actualNotes);
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1500);
  };

  const toggleNote = (noteStr: string) => {
    if (isRevealed) return;
    setSelectedNotes((prev) => 
      prev.includes(noteStr) 
        ? prev.filter((n) => n !== noteStr)
        : [...prev, noteStr]
    );
  };

  const clearNotes = () => {
    if (isRevealed) return;
    setSelectedNotes([]);
  };

  const checkAnswer = () => {
    if (selectedNotes.length === 0) return;
    
    // Sort both arrays to compare correctly, ignoring order
    // But our notes have octaves, so direct string comparison after sort is fine.
    // However, some chords might span into octave 6 if root is high. 
    // Wait, getChordNotes uses rootIndex + interval. If interval + rootIndex >= 12, octave increases.
    // E.g., root 'A' (index 9) + major 3rd (interval 4) = index 1, octave 5 -> 'C#5'.
    // If root is 'A' and interval is 14 (9th), index 9+14=23. 23/12 = 1. Octave = 4 + 1 = 5. Note = 'B5'.
    // So the maximum note is 'B5' except for some high roots with 13ths (interval 21).
    // root 'B' (index 11) + 21 = 32. 32/12 = 2. Octave = 4 + 2 = 6. Note = 'G#6'.
    // Our UI only has C4 to B5! If a chord goes to octave 6, it cannot be guessed.
    // To fix this without changing UI, we can limit the base octave or ensure the chord notes fall within 2 octaves.
    
    const sortedSelected = [...selectedNotes].sort();
    const sortedActual = [...actualNotes].sort();
    
    const correct = sortedSelected.length === sortedActual.length && 
                    sortedSelected.every((val, index) => val === sortedActual[index]);
    
    setIsCorrect(correct);
    setIsRevealed(true);
  };

  // Helper to determine button styling based on state
  const getNoteButtonClass = (noteStr: string) => {
    const isSelected = selectedNotes.includes(noteStr);
    const isActuallyInChord = actualNotes.includes(noteStr);
    
    if (!isRevealed) {
      return `btn-item ${isSelected ? 'active' : ''}`;
    }
    
    if (isActuallyInChord && isSelected) {
      return 'btn-item active correct'; // correctly guessed
    }
    if (isActuallyInChord && !isSelected) {
      return 'btn-item missed'; // missed this note
    }
    if (!isActuallyInChord && isSelected) {
      return 'btn-item active wrong'; // wrongly guessed
    }
    return 'btn-item opacity-50'; // not selected, not in chord
  };

  return (
    <>
      <header className="header">
        <h1>Chord Quiz</h1>
        <p>Listen to the chord and guess the notes</p>
      </header>

      <div className="chord-display" style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {isRevealed ? (
          <>
            <h2 style={{ color: isCorrect ? 'var(--accent-color)' : '#ef4444', marginBottom: '0.5rem', fontSize: '2.5rem' }}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </h2>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
              Answer: {currentRoot} {currentChord.name}
            </p>
            <p>Notes: {actualNotes.join(', ')}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button 
                className={`play-button ${isPlaying && !isLoading ? 'playing' : ''}`}
                onClick={playCurrentChord}
                disabled={isLoading}
                style={{ 
                  margin: 0, 
                  width: 'auto', 
                  padding: '0.5rem 1.5rem', 
                  borderRadius: '2rem', 
                  gap: '0.5rem',
                  fontSize: '0.95rem',
                  height: 'auto',
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                <span>Play Again</span>
              </button>
              <button 
                className="play-button"
                onClick={generateNewChord}
                style={{ 
                  margin: 0, 
                  width: 'auto', 
                  padding: '0.5rem 1.5rem', 
                  borderRadius: '2rem', 
                  gap: '0.5rem', 
                  fontSize: '0.95rem',
                  height: 'auto',
                  background: 'var(--accent-color)' 
                }}
              >
                <RefreshCw size={18} />
                <span>Next Chord</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Listen Carefully</h2>
            <button 
              className={`play-button ${isPlaying && !isLoading ? 'playing' : ''}`}
              onClick={playCurrentChord}
              disabled={isLoading}
              style={isLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              aria-label="Play Chord"
            >
              {isLoading ? <Loader2 size={32} className="animate-spin" /> : <Play size={32} fill="currentColor" />}
            </button>
            {isLoading && <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--primary-color)' }}>Loading samples...</p>}
          </>
        )}
      </div>

      <div className="controls-card">
        <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem' }}>
          <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
            Selected: {selectedNotes.length > 0 ? selectedNotes.join(', ') : 'None'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-toggle" onClick={clearNotes} disabled={isRevealed}>
              Clear
            </button>
            {!isRevealed && (
              <button 
                className="btn-toggle active" 
                onClick={checkAnswer}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 1rem' }}
              >
                <CheckCircle2 size={18} />
                <span>Check</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid-section">
          <h3 className="section-title">Select Notes (C4 - B5)</h3>
          <div className="item-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {QUIZ_NOTES.map((noteStr) => (
              <button
                key={noteStr}
                className={getNoteButtonClass(noteStr)}
                onClick={() => toggleNote(noteStr)}
                disabled={isRevealed}
              >
                {noteStr}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
