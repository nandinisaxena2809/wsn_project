import React from 'react';
import { getStatus, THRESHOLDS } from '../utils/thresholds';

/**
 * Card component displaying a single sensor's live value.
 * Color-coded border based on current status.
 * Handles MQ7 digital sensor (0/1) with special display.
 */
export default function LiveDataCard({ sensorKey, value }) {
  const config = THRESHOLDS[sensorKey];
  if (!config) return null;

  const status = getStatus(sensorKey, value);
  const statusColors = {
    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  // Special display for MQ7 digital sensor
  if (sensorKey === 'mq7') {
    const gasDetected = value === 1;
    return (
      <div className={`live-card ${gasDetected ? 'danger' : 'safe'}`}>
        <div className="live-card-icon">{config.icon}</div>
        <div className="live-card-value" style={{ color: gasDetected ? '#ef4444' : '#10b981' }}>
          {gasDetected ? 'GAS DETECTED' : 'SAFE'}
        </div>
        <div className="live-card-label">{config.label}</div>
        <div className={`live-card-status-dot ${gasDetected ? 'danger' : 'safe'}`} />
      </div>
    );
  }

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
