import { useState, useEffect } from 'react';
import { Play, Settings2, Loader2 } from 'lucide-react';
import { audioEngine, type InstrumentType } from '../utils/audioEngine';
import { NOTES, CHORD_GROUPS, getChordNotes, type Note, type ChordDefinition } from '../utils/musicTheory';

export default function ChordPlayer() {
  const [selectedKey, setSelectedKey] = useState<Note>('C');
  const [selectedChord, setSelectedChord] = useState<ChordDefinition>(CHORD_GROUPS[0].chords[0]);
  const [instrument, setInstrument] = useState<InstrumentType>('Piano'); // Default to Piano
  const [isPlaying, setIsPlaying] = useState(false);
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
    
    return () => {
      document.removeEventListener('click', initAudio);
    };
  }, []);

  const handlePlayChord = (root: Note, chord: ChordDefinition) => {
    if (isLoading) return;
    const notes = getChordNotes(root, chord);
    audioEngine.playChord(notes);
    
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  };

  const handleInstrumentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInst = e.target.value as InstrumentType;
    setInstrument(newInst);
    audioEngine.setInstrument(newInst);
  };

  return (
    <>
      <header className="header">
        <h1>Chord Explorer</h1>
        <p>Listen to every chord in the universe</p>
      </header>

      <div className="chord-display">
        <h2>{selectedKey} {selectedChord.name}</h2>
        <p>Notes: {getChordNotes(selectedKey, selectedChord).join(', ')}</p>
        <button 
          className={`play-button ${isPlaying && !isLoading ? 'playing' : ''}`}
          onClick={() => handlePlayChord(selectedKey, selectedChord)}
          disabled={isLoading}
          style={isLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          aria-label="Play Chord"
        >
          {isLoading ? <Loader2 size={32} className="animate-spin" /> : <Play size={32} fill="currentColor" />}
        </button>
        {isLoading && <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--primary-color)' }}>Loading samples...</p>}
      </div>

      <div className="controls-card">
        <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
          <div className="select-group">
            <Settings2 size={20} className="text-muted" />
            <span className="toggle-label">Instrument:</span>
            <select value={instrument} onChange={handleInstrumentChange} disabled={isLoading}>
              <option value="Piano">Grand Piano</option>
              <option value="FMSynth">FM Synth (E-Piano like)</option>
              <option value="AMSynth">AM Synth (Complex)</option>
              <option value="Synth">Basic Synth</option>
            </select>
          </div>
        </div>

        <div className="grid-section">
          <h3 className="section-title">Select Key</h3>
          <div className="item-grid">
            {NOTES.map((note) => (
              <button
                key={note}
                className={`btn-item ${selectedKey === note ? 'active' : ''}`}
                onClick={() => setSelectedKey(note)}
                disabled={isLoading}
                style={isLoading ? { opacity: 0.6 } : {}}
              >
                {note}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-section">
          <h3 className="section-title">Select Chord Type</h3>
          {CHORD_GROUPS.map((group) => (
            <div key={group.category} className="chord-group-container">
              <h4 className="group-title">{group.category}</h4>
              <div className="item-grid chord-grid">
                {group.chords.map((chord) => (
                  <button
                    key={chord.name}
                    className={`btn-item ${selectedChord.name === chord.name ? 'active' : ''}`}
                    onClick={() => {
                      if (isLoading) return;
                      setSelectedChord(chord);
                      handlePlayChord(selectedKey, chord);
                    }}
                    disabled={isLoading}
                    style={isLoading ? { opacity: 0.6 } : {}}
                  >
                    <span>{chord.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
