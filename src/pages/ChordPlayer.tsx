import { useState, useEffect } from 'react';
import { Play, Settings2 } from 'lucide-react';
import { audioEngine, type InstrumentType } from '../utils/audioEngine';
import { NOTES, CHORD_GROUPS, getChordNotes, type Note, type ChordDefinition } from '../utils/musicTheory';

type Mode = 'FIX_KEY' | 'FIX_CHORD';

export default function ChordPlayer() {
  const [mode, setMode] = useState<Mode>('FIX_KEY');
  const [selectedKey, setSelectedKey] = useState<Note>('C');
  const [selectedChord, setSelectedChord] = useState<ChordDefinition>(CHORD_GROUPS[0].chords[0]);
  const [instrument, setInstrument] = useState<InstrumentType>('FMSynth');
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    const initAudio = () => {
      audioEngine.initialize();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const handlePlayChord = (root: Note, chord: ChordDefinition) => {
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

  const renderChordGroups = () => (
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
                  setSelectedChord(chord);
                  handlePlayChord(selectedKey, chord);
                }}
              >
                <span>{chord.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

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
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={() => handlePlayChord(selectedKey, selectedChord)}
          aria-label="Play Chord"
        >
          <Play size={32} fill="currentColor" />
        </button>
      </div>

      <div className="controls-card">
        <div className="toolbar">
          <div className="toggle-group">
            <span className="toggle-label">Mode:</span>
            <button 
              className={`btn-toggle ${mode === 'FIX_KEY' ? 'active' : ''}`}
              onClick={() => setMode('FIX_KEY')}
            >
              Fix Key
            </button>
            <button 
              className={`btn-toggle ${mode === 'FIX_CHORD' ? 'active' : ''}`}
              onClick={() => setMode('FIX_CHORD')}
            >
              Fix Chord
            </button>
          </div>

          <div className="select-group">
            <Settings2 size={20} className="text-muted" />
            <span className="toggle-label">Instrument:</span>
            <select value={instrument} onChange={handleInstrumentChange}>
              <option value="FMSynth">FM Synth (E-Piano like)</option>
              <option value="AMSynth">AM Synth (Complex)</option>
              <option value="Synth">Basic Synth</option>
            </select>
          </div>
        </div>

        {mode === 'FIX_KEY' ? (
          <>
            <div className="grid-section">
              <h3 className="section-title">Select Key</h3>
              <div className="item-grid">
                {NOTES.map((note) => (
                  <button
                    key={note}
                    className={`btn-item ${selectedKey === note ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedKey(note);
                      handlePlayChord(note, selectedChord);
                    }}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
            {renderChordGroups()}
          </>
        ) : (
          <>
            {renderChordGroups()}
            <div className="grid-section">
              <h3 className="section-title">Select Key</h3>
              <div className="item-grid">
                {NOTES.map((note) => (
                  <button
                    key={note}
                    className={`btn-item ${selectedKey === note ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedKey(note);
                      handlePlayChord(note, selectedChord);
                    }}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
