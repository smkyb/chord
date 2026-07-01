import { useState, useEffect } from 'react';
import { Search, Play, Loader2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { NOTES, type Note, detectChords, type DetectedChord, getChordNotes } from '../utils/musicTheory';

export default function ChordAnalyzer() {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    audioEngine.onLoadStateChange = (loading) => {
      setIsLoading(loading);
    };

    const initAudio = () => {
      audioEngine.initialize();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const toggleNote = (note: Note) => {
    setSelectedNotes((prev) => 
      prev.includes(note) 
        ? prev.filter((n) => n !== note)
        : [...prev, note]
    );
  };

  const clearNotes = () => {
    setSelectedNotes([]);
  };

  const handlePlay = (match: DetectedChord, index: number) => {
    if (isLoading) return;
    const notes = getChordNotes(match.root, match.chord);
    audioEngine.playChord(notes);
    setPlayingIndex(index);
    setTimeout(() => {
      setPlayingIndex(null);
    }, 1500);
  };

  const detectedChords: DetectedChord[] = detectChords(selectedNotes);

  return (
    <>
      <header className="header">
        <h1>Chord Analyzer</h1>
        <p>Select notes to find out what chord they make</p>
      </header>

      <div className="controls-card">
        <div className="toolbar" style={{ justifyContent: 'flex-end', marginBottom: '0.75rem', paddingBottom: '0.5rem' }}>
          <button className="btn-toggle" onClick={clearNotes}>
            Clear Selection
          </button>
        </div>

        <div className="grid-section">
          <h3 className="section-title">Select Notes</h3>
          <div className="item-grid">
            {NOTES.map((note) => (
              <button
                key={note}
                className={`btn-item ${selectedNotes.includes(note) ? 'active' : ''}`}
                onClick={() => toggleNote(note)}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chord-display" style={{ textAlign: 'left', minHeight: '160px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem' }}>
          <Search size={22} />
          Detection Results
        </h2>
        
        {selectedNotes.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>Please select some notes above.</p>
        ) : detectedChords.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>No standard chords detected for this combination.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {detectedChords.map((match, index) => (
              <div 
                key={index} 
                style={{ 
                  background: 'var(--surface-color)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-color)', display: 'block' }}>
                    {match.root} {match.chord.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Notes: {getChordNotes(match.root, match.chord).join(', ')}
                  </span>
                </div>

                <button
                  className={`btn-toggle ${playingIndex === index ? 'active' : ''}`}
                  onClick={() => handlePlay(match, index)}
                  disabled={isLoading}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.3rem', 
                    padding: '0.4rem 0.7rem', 
                    flexShrink: 0,
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                  aria-label={`Play ${match.root} ${match.chord.name}`}
                >
                  {isLoading && playingIndex === index ? (
                     <Loader2 size={16} className="animate-spin" />
                  ) : (
                     <Play size={16} fill="currentColor" />
                  )}
                  <span>Play</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
