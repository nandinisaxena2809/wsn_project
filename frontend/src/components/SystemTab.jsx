import React from 'react';
import { THRESHOLDS } from '../utils/thresholds';
import { getCSVExportURL } from '../utils/api';

/**
 * System tab — connection info, thresholds config, data management.
 */
export default function SystemTab({ isConnected, latest, history, onRefresh }) {
  const handleExportCSV = () => {
    window.open(getCSVExportURL(), '_blank');
  };

  const uptime = latest?.createdAt
    ? Math.round((Date.now() - new Date(history[0]?.createdAt || Date.now()).getTime()) / 1000)
    : 0;

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="tab-content system-tab">
      <h2 className="page-title">⚙️ System Information</h2>

      {/* System Status Cards */}
      <div className="system-cards-grid">
        {/* Connection Card */}
        <div className="system-card">
          <div className="system-card-header">
            <span className="system-card-icon">🌐</span>
            <h3>Connection Status</h3>
          </div>
          <div className="system-card-body">
            <div className="system-info-row">
              <span className="info-label">WebSocket</span>
              <span className={`info-value ${isConnected ? 'text-safe' : 'text-danger'}`}>
                {isConnected ? '● Connected' : '○ Disconnected'}
              </span>
            </div>
            <div className="system-info-row">
              <span className="info-label">Backend URL</span>
              <span className="info-value mono">localhost:5000</span>
            </div>
            <div className="system-info-row">
              <span className="info-label">Protocol</span>
              <span className="info-value">Socket.IO + HTTP REST</span>
            </div>
            <div className="system-info-row">
              <span className="info-label">Fallback</span>
              <span className="info-value">10s Polling</span>
            </div>
          </div>
        </div>

        {/* Data Stats Card */}
        <div className="system-card">
          <div className="system-card-header">
            <span className="system-card-icon">📊</span>
            <h3>Data Statistics</h3>
          </div>
          <div className="system-card-body">
            <div className="system-info-row">
              <span className="info-label">Total Readings</span>
              <span className="info-value">{history.length}</span>
            </div>
            <div className="system-info-row">
              <span className="info-label">Session Duration</span>
              <span className="info-value">{formatUptime(uptime)}</span>
            </div>
            <div className="system-info-row">
              <span className="info-label">Last Update</span>
              <span className="info-value">
                {latest?.createdAt ? new Date(latest.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="system-info-row">
              <span className="info-label">Flame Events</span>
              <span className="info-value">{history.filter(d => d.flame).length}</span>
            </div>
          </div>
        </div>

        {/* Hardware Card */}
        <div className="system-card">
          <div className="system-card-header">
            <span className="system-card-icon">🔌</span>
            <h3>Hardware Config</h3>
          </div>
          <div className="system-card-body">
            <div className="system-info-row">
              <span className="info-label">MCU</span>
              <span className="info-value">NodeMCU ESP8266</span>
            </div>
            <div className="system-info-row">
              <span className="info-label">Sensors</span>
              <span className="info-value">DHT11, MQ2, MQ7, MQ135, Flame</span>
            </div>
            <div className="system-info-row">
              <span className="info-label">Comm Protocol</span>
              <span className="info-value">HTTP POST (JSON)</span>
            </div>
            <div className="system-info-row">
              <span className="info-label">Send Interval</span>
              <span className="info-value">5 seconds</span>
            </div>
          </div>
        </div>

        {/* API Card */}
        <div className="system-card">
          <div className="system-card-header">
            <span className="system-card-icon">🔗</span>
            <h3>API Endpoints</h3>
          </div>
          <div className="system-card-body">
            <div className="api-endpoint">
              <span className="http-method post">POST</span>
              <span className="api-path">/api/sensor-data</span>
            </div>
            <div className="api-endpoint">
              <span className="http-method get">GET</span>
              <span className="api-path">/api/sensor-data/latest</span>
            </div>
            <div className="api-endpoint">
              <span className="http-method get">GET</span>
              <span className="api-path">/api/sensor-data/history</span>
            </div>
            <div className="api-endpoint">
              <span className="http-method get">GET</span>
              <span className="api-path">/api/sensor-data/export/csv</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thresholds Config Display */}
      <section className="system-section">
        <h3 className="system-section-title">⚠️ Alert Thresholds</h3>
        <div className="thresholds-table-wrapper">
          <table className="thresholds-table">
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Unit</th>
                <th>Range</th>
                <th>🟡 Warning</th>
                <th>🔴 Danger</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(THRESHOLDS).map(([key, t]) => (
                <tr key={key}>
                  <td>
                    <span className="threshold-sensor">
                      {t.icon} {t.label}
                    </span>
                  </td>
                  <td><span className="threshold-unit">{t.unit}</span></td>
                  <td>{t.min} – {t.max}</td>
                  <td className="text-warning">≥ {t.warning}</td>
                  <td className="text-danger">≥ {t.danger}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Actions */}
      <div className="system-actions">
        <button className="system-action-btn" onClick={onRefresh}>
          🔄 Refresh All Data
        </button>
        <button className="system-action-btn primary" onClick={handleExportCSV}>
          📥 Export Data as CSV
        </button>
      </div>
    </div>
  );
}
