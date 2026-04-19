import React, { useMemo, useState } from 'react';
import { getAlerts, THRESHOLDS } from '../utils/thresholds';

/**
 * Alerts tab — live alert log with event history and filtering.
 */
export default function AlertsTab({ latest, history }) {
  const [filter, setFilter] = useState('all'); // 'all', 'danger', 'warning'

  // Build alert history from all readings
  const alertHistory = useMemo(() => {
    const allAlerts = [];
    history.forEach((reading) => {
      const alerts = getAlerts(reading);
      alerts.forEach((alert) => {
        allAlerts.push({
          ...alert,
          timestamp: reading.createdAt,
          reading,
        });
      });
    });
    // Newest first
    return allAlerts.reverse();
  }, [history]);

  const currentAlerts = getAlerts(latest);

  const filteredAlerts = filter === 'all'
    ? alertHistory
    : alertHistory.filter((a) => a.level === filter);

  const dangerCount = alertHistory.filter((a) => a.level === 'danger').length;
  const warningCount = alertHistory.filter((a) => a.level === 'warning').length;

  return (
    <div className="tab-content alerts-tab">
      {/* Current Status Banner */}
      <div className={`alerts-status-banner ${currentAlerts.length > 0 ? 'has-alerts' : 'all-clear'}`}>
        <div className="status-banner-content">
          {currentAlerts.length > 0 ? (
            <>
              <div className="status-banner-icon danger-pulse">🚨</div>
              <div>
                <h2 className="status-banner-title">Active Alerts</h2>
                <p className="status-banner-desc">{currentAlerts.length} alert(s) detected — immediate action may be required</p>
              </div>
            </>
          ) : (
            <>
              <div className="status-banner-icon">✅</div>
              <div>
                <h2 className="status-banner-title">All Clear</h2>
                <p className="status-banner-desc">All sensor readings are within safe parameters</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Current Alerts */}
      {currentAlerts.length > 0 && (
        <div className="current-alerts-grid">
          {currentAlerts.map((alert, i) => (
            <div key={i} className={`current-alert-card alert-${alert.level}`}>
              <div className="current-alert-pulse" />
              <div className="current-alert-content">
                <span className="current-alert-msg">{alert.message}</span>
                <span className="current-alert-time">Active now</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="alert-stats-row">
        <div className="alert-stat" onClick={() => setFilter('all')}>
          <span className="alert-stat-num">{alertHistory.length}</span>
          <span className="alert-stat-label">Total Events</span>
        </div>
        <div className="alert-stat danger" onClick={() => setFilter('danger')}>
          <span className="alert-stat-num">{dangerCount}</span>
          <span className="alert-stat-label">Danger</span>
        </div>
        <div className="alert-stat warning" onClick={() => setFilter('warning')}>
          <span className="alert-stat-num">{warningCount}</span>
          <span className="alert-stat-label">Warnings</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="alert-filter-bar">
        <button className={`filter-btn ${filter === 'all' ? 'active':''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'danger' ? 'active':''}`} onClick={() => setFilter('danger')}>🔴 Danger</button>
        <button className={`filter-btn ${filter === 'warning' ? 'active':''}`} onClick={() => setFilter('warning')}>🟡 Warning</button>
      </div>

      {/* Alert Timeline */}
      <div className="alert-timeline">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎉</span>
            <h3>No alerts to display</h3>
            <p>All systems operating normally</p>
          </div>
        ) : (
          filteredAlerts.slice(0, 50).map((alert, i) => (
            <div key={i} className={`timeline-item timeline-${alert.level}`}>
              <div className="timeline-dot" />
              <div className="timeline-line" />
              <div className="timeline-card">
                <div className="timeline-card-header">
                  <span className={`timeline-level ${alert.level}`}>
                    {alert.level === 'danger' ? '🔴' : '🟡'} {alert.level.toUpperCase()}
                  </span>
                  <span className="timeline-time">
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Unknown'}
                  </span>
                </div>
                <p className="timeline-message">{alert.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
