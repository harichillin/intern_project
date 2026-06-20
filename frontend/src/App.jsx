import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customer360 from './pages/Customer360';
import FraudCenter from './pages/FraudCenter';
import TimelineView from './pages/TimelineView';

function App() {
  return (
    <Router>
      <div className="flex bg-background min-h-screen text-white font-sans">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customer360 />} />
            <Route path="/fraud" element={<FraudCenter />} />
            <Route path="/reports" element={<TimelineView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
