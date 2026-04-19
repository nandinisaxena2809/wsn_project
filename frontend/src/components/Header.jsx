import React from 'react';
import StatusIndicator from './StatusIndicator';

/**
 * Dashboard header with system title, connection status, and action buttons.
 */
export default function Header({ isConnected, onRefresh, onExportCSV }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="header-logo">
          <span className="logo-icon">🛡️</span>
          <div>
            <h1 className="header-title">Fire & Gas Monitor</h1>
            <p className="header-subtitle">IoT Sensor Dashboard — Real-Time</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        <StatusIndicator
          status={isConnected ? 'safe' : 'offline'}
          label={isConnected ? 'Live' : 'Offline'}
        />
        <button className="header-btn" onClick={onRefresh} title="Refresh Data">
          🔄 Refresh
        </button>
        <button className="header-btn header-btn-export" onClick={onExportCSV} title="Export CSV">
          📥 Export CSV
        </button>
      </div>
    </header>
  );
}
