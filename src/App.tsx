import React, { useState } from 'react';
import LandingPage from './landing/LandingPage';
import DashboardApp from './dashboard/DashboardApp';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  if (view === 'dashboard') {
    return <DashboardApp onBackToLanding={() => setView('landing')} />;
  }

  return <LandingPage onLaunchDashboard={() => setView('dashboard')} />;
}
