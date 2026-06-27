import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Music, Search } from 'lucide-react';
import ChordPlayer from './pages/ChordPlayer';
import ChordAnalyzer from './pages/ChordAnalyzer';

function App() {
  return (
    <Router>
      <div className="container">
        <nav className="nav-bar">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end
          >
            <Music size={20} />
            <span>Explorer</span>
          </NavLink>
          <NavLink 
            to="/analyze" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Search size={20} />
            <span>Analyzer</span>
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<ChordPlayer />} />
          <Route path="/analyze" element={<ChordAnalyzer />} />
        </Routes>
        
        <footer>
          <p>Built with React & Tone.js</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
