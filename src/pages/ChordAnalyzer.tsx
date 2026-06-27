import { useState } from 'react';
import { Search } from 'lucide-react';
import { NOTES, type Note, detectChords, type DetectedChord } from '../utils/musicTheory';

export default function ChordAnalyzer() {
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);

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

  const detectedChords: DetectedChord[] = detectChords(selectedNotes);

  return (
    <>
      <header className="header">
        <h1>Chord Analyzer</h1>
        <p>Select notes to find out what chord they make</p>
      </header>

      <div className="controls-card">
        <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
          <button className="btn-toggle" onClick={clearNotes}>
            Clear Selection
          </button>
        </div>

        <div className="grid-section">
          <h3 className="section-title">Select Notes</h3>
          <div className="item-grid chord-grid">
            {NOTES.map((note) => (
              <button
                key={note}
                className={`btn-item ${selectedNotes.includes(note) ? 'active' : ''}`}
                onClick={() => toggleNote(note)}
                style={{ minHeight: '60px', fontSize: '1.25rem' }}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chord-display" style={{ textAlign: 'left', minHeight: '200px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          <Search size={28} />
          Detection Results
        </h2>
        
        {selectedNotes.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>Please select some notes above.</p>
        ) : detectedChords.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>No standard chords detected for this combination.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {detectedChords.map((match, index) => (
              <div 
                key={index} 
                style={{ 
                  background: 'var(--surface-color)', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                  {match.root} {match.chord.name}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Root: {match.root}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
