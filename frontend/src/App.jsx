import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Customer360 from './pages/Customer360';
import FraudCenter from './pages/FraudCenter';
import TimelineView from './pages/TimelineView';
import TransactionFeed from './pages/TransactionFeed';
import ControlPanel from './pages/ControlPanel';

function App() {
  return (
    <Router>
      <div className="flex bg-background min-h-screen text-white font-sans">
        <Sidebar />
        <div className="flex-1 ml-64 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/"              element={<Dashboard />} />
              <Route path="/customers"     element={<Customer360 />} />
              <Route path="/fraud"         element={<FraudCenter />} />
              <Route path="/reports"       element={<TimelineView />} />
              <Route path="/transactions"  element={<TransactionFeed />} />
              <Route path="/control"       element={<ControlPanel />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
