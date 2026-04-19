import React from 'react';
import { getStatus, THRESHOLDS } from '../utils/thresholds';

/**
 * Card component displaying a single sensor's live value.
 * Color-coded border based on current status.
 */
export default function LiveDataCard({ sensorKey, value, isFlame }) {
  // Special handling for flame sensor
  if (isFlame) {
    const flameDetected = value === true;
    return (
      <div className={`live-card ${flameDetected ? 'danger' : 'safe'}`}>
        <div className="live-card-icon">🔥</div>
        <div className="live-card-value" style={{ color: flameDetected ? '#ef4444' : '#10b981' }}>
          {flameDetected ? 'DETECTED' : 'NONE'}
        </div>
        <div className="live-card-label">Flame Status</div>
        <div className={`live-card-status-dot ${flameDetected ? 'danger' : 'safe'}`} />
      </div>
    );
  }

  const config = THRESHOLDS[sensorKey];
  if (!config) return null;

  const status = getStatus(sensorKey, value);
  const statusColors = {
    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  return (
    <div className={`live-card ${status}`}>
      <div className="live-card-icon">{config.icon}</div>
      <div className="live-card-value" style={{ color: statusColors[status] }}>
        {value != null ? value.toFixed(1) : '--'}
        <span className="live-card-unit">{config.unit}</span>
      </div>
      <div className="live-card-label">{config.label}</div>
      <div className={`live-card-status-dot ${status}`} />
    </div>
  );
}
