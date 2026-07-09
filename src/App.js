import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import InputPage from './components/InputPage/InputPage';
import ResultsPage from './components/ResultsPage/ResultsPage';

function App() {
  return (
        <div className="App">
            <HashRouter>
              <Routes>
                <Route path="/" element={<InputPage />} />
                <Route path="/results" element={<ResultsPage />} />
              </Routes>
            </HashRouter>
        </div>
  );
}

export default App;