import React, { useState } from 'react';
import { useSensorData } from './hooks/useSensorData';
import { getAlerts } from './utils/thresholds';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import AnalyticsTab from './components/AnalyticsTab';
import AlertsTab from './components/AlertsTab';
import SystemTab from './components/SystemTab';

/**
 * Main application with sidebar navigation and multi-tab layout.
 */
export default function App() {
  const { latest, history, isConnected, loading, error, refresh } = useSensorData();
  const [activeTab, setActiveTab] = useState('dashboard');

  const alerts = getAlerts(latest);

  // Overall system status for ambient effects
  const getSystemStatus = () => {
    if (!isConnected) return 'offline';
    if (alerts.some((a) => a.level === 'danger')) return 'danger';
    if (alerts.some((a) => a.level === 'warning')) return 'warning';
    return 'safe';
  };

  const systemStatus = getSystemStatus();

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab latest={latest} history={history} />;
      case 'analytics':
        return <AnalyticsTab history={history} />;
      case 'alerts':
        return <AlertsTab latest={latest} history={history} />;
      case 'system':
        return <SystemTab isConnected={isConnected} latest={latest} history={history} onRefresh={refresh} />;
      default:
        return <DashboardTab latest={latest} history={history} />;
    }
  };

  return (
    <div className={`app-shell status-${systemStatus}`}>
      {/* Animated background particles */}
      <div className="bg-effects">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-orb orb-3" />
      </div>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={alerts.length}
        isConnected={isConnected}
      />

      {/* Main Content */}
      <div className="main-panel">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-bar-title">
              {activeTab === 'dashboard' && '📊 Dashboard'}
              {activeTab === 'analytics' && '📈 Analytics'}
              {activeTab === 'alerts' && '🚨 Alerts'}
              {activeTab === 'system' && '⚙️ System'}
            </h1>
            <span className="top-bar-breadcrumb">FireGuard / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          </div>
          <div className="top-bar-right">
            {/* Active alert badge */}
            {alerts.length > 0 && (
              <button
                className="top-alert-badge"
                onClick={() => setActiveTab('alerts')}
              >
                <span className="badge-pulse" />
                {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
              </button>
            )}
            <div className={`top-connection ${isConnected ? 'online' : 'offline'}`}>
              <span className="top-conn-dot" />
              <span>{isConnected ? 'Live Feed' : 'Disconnected'}</span>
            </div>
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="loading-screen">
            <div className="loading-ripple">
              <div /><div />
            </div>
            <p className="loading-text">Connecting to sensor network...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error-toast">
            <span>⚠️ {error}</span>
            <button onClick={refresh}>Retry</button>
          </div>
        )}

        {/* Tab Content with transition */}
        <div className="tab-viewport" key={activeTab}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
