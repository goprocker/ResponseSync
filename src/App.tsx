import React, { useState, useEffect } from 'react';
import LandingPage from './landing/LandingPage';
import DashboardApp from './dashboard/DashboardApp';

export type DashboardTab = 'twin_map' | 'multi_agent' | 'simulation' | 'citizen_portal' | 'analytics';

function getRouteFromPath(path: string): { view: 'landing' | 'dashboard'; tab: DashboardTab } {
  const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';

  switch (cleanPath) {
    case '/citizen':
      return { view: 'dashboard', tab: 'citizen_portal' };
    case '/authority':
    case '/command':
      return { view: 'dashboard', tab: 'multi_agent' };
    case '/simulation':
      return { view: 'dashboard', tab: 'simulation' };
    case '/analytics':
    case '/fusion':
      return { view: 'dashboard', tab: 'analytics' };
    case '/dashboard':
    case '/twin':
    case '/map':
      return { view: 'dashboard', tab: 'twin_map' };
    case '/':
    default:
      return { view: 'landing', tab: 'twin_map' };
  }
}

export default function App() {
  const [route, setRoute] = useState(() => getRouteFromPath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setRoute(getRouteFromPath(path));
  };

  if (route.view === 'dashboard') {
    return (
      <DashboardApp
        initialTab={route.tab}
        onBackToLanding={() => navigateTo('/')}
        onNavigateTab={(tab) => {
          const tabPathMap: Record<DashboardTab, string> = {
            twin_map: '/dashboard',
            multi_agent: '/authority',
            simulation: '/simulation',
            citizen_portal: '/citizen',
            analytics: '/analytics'
          };
          navigateTo(tabPathMap[tab] || '/dashboard');
        }}
      />
    );
  }

  return (
    <LandingPage
      onLaunchDashboard={(targetTab?: string) => {
        if (targetTab === 'citizen') navigateTo('/citizen');
        else if (targetTab === 'authority') navigateTo('/authority');
        else if (targetTab === 'simulation') navigateTo('/simulation');
        else if (targetTab === 'analytics') navigateTo('/analytics');
        else navigateTo('/dashboard');
      }}
    />
  );
}
