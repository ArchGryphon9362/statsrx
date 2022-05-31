import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './Header'
import { General } from './Locations/General'

function App() {
  return (
    <div id='root-app'>
      <Header />
      <div id='router'>
        <Router>
          <Routes>
            <Route path='/' element={<General />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
