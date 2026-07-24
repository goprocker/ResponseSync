import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './landing/LandingPage';
import DashboardApp from './dashboard/DashboardApp';

export type DashboardTab =
  | 'dashboard'
  | 'incidents'
  | 'twin_map'
  | 'resources'
  | 'shelters'
  | 'hospitals'
  | 'multi_agent'
  | 'simulation'
  | 'citizen_portal'
  | 'analytics'
  | 'settings';

function getRouteFromPath(path: string): { view: 'landing' | 'dashboard'; tab: DashboardTab } {
  const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';

  switch (cleanPath) {
    case '/dashboard':
      return { view: 'dashboard', tab: 'dashboard' };
    case '/incidents':
      return { view: 'dashboard', tab: 'incidents' };
    case '/twin':
    case '/map':
      return { view: 'dashboard', tab: 'twin_map' };
    case '/resources':
      return { view: 'dashboard', tab: 'resources' };
    case '/shelters':
      return { view: 'dashboard', tab: 'shelters' };
    case '/hospitals':
      return { view: 'dashboard', tab: 'hospitals' };
    case '/authority':
    case '/command':
      return { view: 'dashboard', tab: 'multi_agent' };
    case '/simulation':
      return { view: 'dashboard', tab: 'simulation' };
    case '/citizen':
      return { view: 'dashboard', tab: 'citizen_portal' };
    case '/analytics':
    case '/fusion':
      return { view: 'dashboard', tab: 'analytics' };
    case '/settings':
      return { view: 'dashboard', tab: 'settings' };
    case '/':
    default:
      return { view: 'landing', tab: 'dashboard' };
  }
}

const tabPathMap: Record<DashboardTab, string> = {
  dashboard: '/dashboard',
  incidents: '/incidents',
  twin_map: '/map',
  resources: '/resources',
  shelters: '/shelters',
  hospitals: '/hospitals',
  multi_agent: '/authority',
  simulation: '/simulation',
  citizen_portal: '/citizen',
  analytics: '/analytics',
  settings: '/settings',
};

export default function App() {
  const [route, setRoute] = useState(() => getRouteFromPath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setRoute(getRouteFromPath(path));
  }, []);

  const handleBackToLanding = useCallback(() => navigateTo('/'), [navigateTo]);

  const handleNavigateTab = useCallback((tab: DashboardTab) => {
    navigateTo(tabPathMap[tab] || '/dashboard');
  }, [navigateTo]);

  const handleLaunchDashboard = useCallback((targetTab?: string) => {
    if (targetTab === 'citizen') navigateTo('/citizen');
    else if (targetTab === 'authority') navigateTo('/authority');
    else if (targetTab === 'simulation') navigateTo('/simulation');
    else if (targetTab === 'analytics') navigateTo('/analytics');
    else navigateTo('/dashboard');
  }, [navigateTo]);

  if (route.view === 'dashboard') {
    return (
      <DashboardApp
        initialTab={route.tab}
        onBackToLanding={handleBackToLanding}
        onNavigateTab={handleNavigateTab}
      />
    );
  }

  return (
    <LandingPage
      onLaunchDashboard={handleLaunchDashboard}
    />
  );
}
