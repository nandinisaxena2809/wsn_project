import React from 'react';

/**
 * Sidebar navigation with animated icons and active state.
 */
const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
  { id: 'alerts', icon: '🚨', label: 'Alerts' },
  { id: 'system', icon: '⚙️', label: 'System' },
];

export default function Sidebar({ activeTab, onTabChange, alertCount, isConnected }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <svg viewBox="0 0 40 40" className="logo-svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" />
            <path d="M20 8 L20 20 L28 28" fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="20" r="3" fill="url(#logoGrad)" />
          </svg>
        </div>
        <div className="sidebar-brand-text">
          <span className="brand-title">FireGuard</span>
          <span className="brand-sub">IoT Monitor</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.id === 'alerts' && alertCount > 0 && (
              <span className="nav-badge">{alertCount}</span>
            )}
            {activeTab === item.id && <div className="nav-active-indicator" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`connection-chip ${isConnected ? 'online' : 'offline'}`}>
          <span className="connection-dot" />
          <span>{isConnected ? 'Live' : 'Offline'}</span>
        </div>
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  );
}
