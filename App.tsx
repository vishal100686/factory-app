
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ReportsPage from './pages/ReportsPage'; // New Import
import { Toaster } from './components/ui/Toaster'; // Simple toast component

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} /> {/* New Route */}
          </Routes>
        </main>
        <footer className="bg-brand-dark text-white text-center p-4">
          © ${new Date().getFullYear()} FactoryPulse. All rights reserved.
        </footer>
        <Toaster />
      </div>
    </HashRouter>
  );
};

export default App;