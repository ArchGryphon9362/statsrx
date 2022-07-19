import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { General } from './Locations/General'

function App() {
  return (
    <div id='root-app'>
      <Router>
        <Routes>
          <Route path='/' element={<General />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
