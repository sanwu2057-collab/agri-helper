/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SideNav from './components/SideNav';
import LanguageSwitcher from './components/LanguageSwitcher';
import PlantDetector from './components/PlantDetector';
import ClimateDetector from './components/ClimateDetector';
import DroughtAssistant from './components/DroughtAssistant';
import VoiceAssistant from './components/VoiceAssistant';
import PestDetector from './components/PestDetector';
import GovernmentSchemes from './components/GovernmentSchemes';
import Market from './components/Market';
import Settings from './components/Settings';
import CropCycleAssistant from './components/CropCycleAssistant';
import WeatherAlerts from './components/WeatherAlerts';
import { ThemeProvider } from './contexts/ThemeContext';

function Dashboard() {
  return (
    <main className="flex-1 p-8">
      <div className="glassmorphism p-8 text-center">
        <h1 className="text-4xl font-bold font-display text-[var(--color-text-primary)] mb-4">Welcome to Agri-Helper</h1>
        <p className="text-lg text-[var(--color-text-secondary)]">Your AI-powered companion for modern farming.</p>
      </div>
    </main>
  );
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
        <SideNav />
        <div className="flex-1 flex flex-col">
          <Header />
          <LanguageSwitcher />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plant-disease-detector" element={<PlantDetector />} />
            <Route path="/drought-assistant" element={<DroughtAssistant />} />
            <Route path="/climate-detector" element={<ClimateDetector />} />
            <Route path="/pest-detector" element={<PestDetector />} />
            <Route path="/government-schemes" element={<GovernmentSchemes />} />
            <Route path="/market" element={<Market />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/crop-cycle-assistant" element={<CropCycleAssistant />} />
            <Route path="/weather-alerts" element={<WeatherAlerts />} />
          </Routes>
        </div>
        <VoiceAssistant />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
