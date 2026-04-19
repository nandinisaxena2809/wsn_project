import React, { useState, useMemo } from 'react';
import SensorChart from './SensorChart';
import { THRESHOLDS, getStatus } from '../utils/thresholds';

/**
 * Analytics tab — full-width charts, data table, and time range filters.
 * Updated for 3-sensor hardware: Temperature, MQ2, MQ7.
 */
export default function AnalyticsTab({ history }) {
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [timeRange, setTimeRange] = useState('all');

  // Filter data by time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return history;
    const now = Date.now();
    const ranges = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };
    const cutoff = now - (ranges[timeRange] || 0);
    return history.filter((d) => new Date(d.createdAt).getTime() > cutoff);
  }, [history, timeRange]);

  // Stats for selected data
  const stats = useMemo(() => {
    if (!filteredData.length) return null;
    const keys = ['temperature', 'mq2', 'mq7'];
    const result = {};
    keys.forEach((key) => {
      const values = filteredData.map((d) => d[key]);
      result[key] = {
        min: Math.min(...values).toFixed(1),
        max: Math.max(...values).toFixed(1),
        avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
        current: values[values.length - 1]?.toFixed(1) || '--',
      };
    });
    return result;
  }, [filteredData]);

  const sensorOptions = [
    { value: 'all', label: 'All Sensors' },
    { value: 'gas', label: 'Gas Levels (MQ2 + MQ7)' },
    { value: 'temperature', label: 'Temperature Only' },
    { value: 'mq2', label: 'MQ2 (Smoke/LPG)' },
    { value: 'mq7', label: 'MQ7 (CO)' },
  ];

  const chartConfigs = {
    all: [
      {
        title: 'Temperature',
        lines: [
          { key: 'temperature', name: 'Temperature (°C)', color: '#f97316' },
        ],
      },
      {
        title: 'Gas Concentrations',
        lines: [
          { key: 'mq2', name: 'MQ2 - Smoke (ppm)', color: '#a855f7' },
          { key: 'mq7', name: 'MQ7 - CO', color: '#ec4899' },
        ],
      },
    ],
    gas: [
      {
        title: 'All Gas Sensors Over Time',
        lines: [
          { key: 'mq2', name: 'MQ2 - Smoke (ppm)', color: '#a855f7' },
          { key: 'mq7', name: 'MQ7 - CO', color: '#ec4899' },
        ],
      },
    ],
    temperature: [{ title: 'Temperature', lines: [{ key: 'temperature', name: 'Temperature (°C)', color: '#f97316' }] }],
    mq2: [{ title: 'MQ2 - Smoke Detection', lines: [{ key: 'mq2', name: 'MQ2 (ppm)', color: '#a855f7' }] }],
    mq7: [{ title: 'MQ7 - Carbon Monoxide', lines: [{ key: 'mq7', name: 'MQ7', color: '#ec4899' }] }],
  };

  const charts = chartConfigs[selectedSensor] || chartConfigs.all;

  return (
    <div className="tab-content analytics-tab">
      {/* Toolbar */}
      <div className="analytics-toolbar">
        <div className="toolbar-left">
          <h2 className="page-title">📈 Analytics</h2>
          <span className="data-count">{filteredData.length} data points</span>
        </div>
        <div className="toolbar-controls">
          <div className="control-group">
            <label className="control-label">Sensor</label>
            <select
              className="control-select"
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
            >
              {sensorOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label className="control-label">Time Range</label>
            <div className="time-range-pills">
              {[
                { value: '5m', label: '5m' },
                { value: '15m', label: '15m' },
                { value: '1h', label: '1h' },
                { value: '6h', label: '6h' },
                { value: '24h', label: '24h' },
                { value: 'all', label: 'All' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`time-pill ${timeRange === opt.value ? 'active' : ''}`}
                  onClick={() => setTimeRange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="analytics-stats">
          {Object.keys(THRESHOLDS).map((key) => (
            <div key={key} className={`analytics-stat-card ${getStatus(key, parseFloat(stats[key]?.current))}`}>
              <div className="stat-card-header">
                <span className="stat-card-icon">{THRESHOLDS[key].icon}</span>
                <span className="stat-card-name">{THRESHOLDS[key].label}</span>
              </div>
              <div className="stat-card-grid">
                <div className="stat-item">
                  <span className="stat-val">{stats[key]?.min}</span>
                  <span className="stat-lbl">Min</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">{stats[key]?.avg}</span>
                  <span className="stat-lbl">Avg</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">{stats[key]?.max}</span>
                  <span className="stat-lbl">Max</span>
                </div>
                <div className="stat-item highlight">
                  <span className="stat-val">{stats[key]?.current}</span>
                  <span className="stat-lbl">Now</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className={`analytics-charts ${charts.length === 1 ? 'single' : ''}`}>
        {charts.map((cfg, i) => (
          <SensorChart key={i} title={cfg.title} data={filteredData} lines={cfg.lines} />
        ))}
      </div>

      {/* Data Table */}
      <section className="data-table-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="section-icon">📋</span>
            Raw Data Log
          </h3>
          <span className="section-meta">Showing latest {Math.min(filteredData.length, 20)}</span>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Temp (°C)</th>
                <th>MQ2 (ppm)</th>
                <th>MQ7 (CO)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(-20).reverse().map((row, i) => {
                const worstStatus = ['temperature', 'mq2', 'mq7']
                  .reduce((worst, key) => {
                    const s = getStatus(key, row[key]);
                    if (s === 'danger') return 'danger';
                    if (s === 'warning' && worst !== 'danger') return 'warning';
                    return worst;
                  }, 'safe');
                
                return (
                  <tr key={i} className={`table-row-${worstStatus}`}>
                    <td>{new Date(row.createdAt).toLocaleTimeString()}</td>
                    <td>{row.temperature?.toFixed(1)}</td>
                    <td>{row.mq2}</td>
                    <td>
                      <span className={`flame-badge ${row.mq7 === 1 ? 'active' : ''}`}>
                        {row.mq7 === 1 ? '⚠️ GAS' : '✓ Safe'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${worstStatus}`}>
                        {worstStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
