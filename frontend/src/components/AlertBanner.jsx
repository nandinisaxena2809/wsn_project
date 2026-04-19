import React from 'react';

/**
 * Alert banner component that displays warning/danger alerts.
 * Supports dismissible alerts with animation.
 */
export default function AlertBanner({ alerts }) {
  if (!alerts || !alerts.length) return null;

  return (
    <div className="alert-banner-container">
      {alerts.map((alert, index) => (
        <div
          key={`${alert.type}-${index}`}
          className={`alert-banner alert-${alert.level}`}
          role="alert"
        >
          <span className="alert-message">{alert.message}</span>
          <span className="alert-pulse" />
        </div>
      ))}
    </div>
  );
}
