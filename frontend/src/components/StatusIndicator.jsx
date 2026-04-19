import React from 'react';

/**
 * Status indicator dot component.
 * Shows Safe (green), Warning (amber), or Danger (red).
 */
export default function StatusIndicator({ status, label }) {
  const statusConfig = {
    safe: { color: '#10b981', text: 'Safe' },
    warning: { color: '#f59e0b', text: 'Warning' },
    danger: { color: '#ef4444', text: 'Danger' },
    offline: { color: '#6b7280', text: 'Offline' },
  };

  const config = statusConfig[status] || statusConfig.safe;

  return (
    <div className="status-indicator">
      <span
        className={`status-dot ${status}`}
        style={{ backgroundColor: config.color }}
      />
      <span className="status-text" style={{ color: config.color }}>
        {label || config.text}
      </span>
    </div>
  );
}
