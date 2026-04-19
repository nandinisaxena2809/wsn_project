import React from 'react';
import LiveDataCard from './LiveDataCard';
import GaugeChart from './GaugeChart';
import SensorChart from './SensorChart';
import { getAlerts } from '../utils/thresholds';

/**
 * Dashboard tab — main overview with live data, gauges, and charts.
 * Updated for 3-sensor hardware: Temperature (DHT11), MQ2, MQ7.
 */
export default function DashboardTab({ latest, history }) {
  const alerts = getAlerts(latest);
  const hasData = latest != null;

  // Quick stats
  const avgTemp = history.length
    ? (history.reduce((s, d) => s + d.temperature, 0) / history.length).toFixed(1)
    : '--';
  const maxMQ2 = history.length
    ? Math.max(...history.map((d) => d.mq2))
    : '--';
  const gasEvents = history.filter((d) => d.mq7 === 1).length;
  const totalReadings = history.length;

  return (
    <div className="tab-content dashboard-tab">
      {/* Quick Stats Row */}
      <div className="quick-stats-row">
        <div className="quick-stat">
          <div className="quick-stat-value">{avgTemp}</div>
          <div className="quick-stat-label">Avg Temp (°C)</div>
          <div className="quick-stat-icon">🌡️</div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-value">{maxMQ2}</div>
          <div className="quick-stat-label">Peak MQ2 (ppm)</div>
          <div className="quick-stat-icon">💨</div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-value flame-stat">{gasEvents}</div>
          <div className="quick-stat-label">MQ7 Gas Events</div>
          <div className="quick-stat-icon">☁️</div>
        </div>
        <div className="quick-stat">
          <div className="quick-stat-value">{totalReadings}</div>
          <div className="quick-stat-label">Total Readings</div>
          <div className="quick-stat-icon">📡</div>
        </div>
      </div>

      {/* Live Data Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">📡</span>
            Live Sensor Readings
          </h2>
          {latest?.createdAt && (
            <span className="section-timestamp">
              {new Date(latest.createdAt).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="live-cards-grid">
          <LiveDataCard sensorKey="temperature" value={latest?.temperature} />
          <LiveDataCard sensorKey="mq2" value={latest?.mq2} />
          <LiveDataCard sensorKey="mq7" value={latest?.mq7} />
        </div>
      </section>

      {/* Gauges Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">⚡</span>
            Sensor Gauges
          </h2>
        </div>
        <div className="gauges-grid">
          <GaugeChart sensorKey="temperature" value={latest?.temperature} />
          <GaugeChart sensorKey="mq2" value={latest?.mq2} />
          <GaugeChart sensorKey="mq7" value={latest?.mq7} />
        </div>
      </section>

      {/* Mini Charts */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">📈</span>
            Recent Trends
          </h2>
          <span className="section-meta">{history.length} readings</span>
        </div>
        <div className="charts-grid">
          <SensorChart
            title="Temperature"
            data={history}
            lines={[
              { key: 'temperature', name: 'Temperature (°C)', color: '#f97316' },
            ]}
          />
          <SensorChart
            title="Gas Levels"
            data={history}
            lines={[
              { key: 'mq2', name: 'MQ2 - Smoke', color: '#a855f7' },
              { key: 'mq7', name: 'MQ7 - CO', color: '#ec4899' },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
