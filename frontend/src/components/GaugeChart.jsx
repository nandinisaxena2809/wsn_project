import React from 'react';
import { getStatus, THRESHOLDS } from '../utils/thresholds';

/**
 * SVG Gauge component for visualizing sensor values.
 * Draws an arc gauge with color coding based on thresholds.
 */
export default function GaugeChart({ sensorKey, value }) {
  const config = THRESHOLDS[sensorKey];
  if (!config) return null;

  const { min, max, unit, label, warning, danger } = config;
  const status = getStatus(sensorKey, value);

  // Clamp value between min and max
  const clampedValue = Math.max(min, Math.min(max, value ?? 0));
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  // Arc geometry
  const radius = 80;
  const strokeWidth = 12;
  const centerX = 100;
  const centerY = 100;
  const startAngle = -225;
  const endAngle = 45;
  const totalAngle = endAngle - startAngle; // 270 degrees
  const currentAngle = startAngle + (percentage / 100) * totalAngle;

  // Warning and danger angle positions for background arcs
  const warningPercentage = ((warning - min) / (max - min)) * 100;
  const dangerPercentage = ((danger - min) / (max - min)) * 100;

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeArc = (cx, cy, r, startAng, endAng) => {
    const start = polarToCartesian(cx, cy, r, endAng);
    const end = polarToCartesian(cx, cy, r, startAng);
    const largeArcFlag = endAng - startAng <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  // Color based on status
  const colors = {
    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };
  const glowColors = {
    safe: 'rgba(16, 185, 129, 0.3)',
    warning: 'rgba(245, 158, 11, 0.3)',
    danger: 'rgba(239, 68, 68, 0.4)',
  };

  const activeColor = colors[status];
  const glowColor = glowColors[status];

  return (
    <div className="gauge-chart" data-status={status}>
      <svg viewBox="0 0 200 160" className="gauge-svg">
        <defs>
          <filter id={`glow-${sensorKey}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`grad-${sensorKey}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset={`${warningPercentage}%`} stopColor="#f59e0b" />
            <stop offset={`${dangerPercentage}%`} stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d={describeArc(centerX, centerY, radius, startAngle, endAngle)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Zone indicators - subtle colored segments */}
        <path
          d={describeArc(centerX, centerY, radius, startAngle, startAngle + (warningPercentage / 100) * totalAngle)}
          fill="none"
          stroke="rgba(16, 185, 129, 0.15)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={describeArc(centerX, centerY, radius, startAngle + (warningPercentage / 100) * totalAngle, startAngle + (dangerPercentage / 100) * totalAngle)}
          fill="none"
          stroke="rgba(245, 158, 11, 0.15)"
          strokeWidth={strokeWidth}
        />
        <path
          d={describeArc(centerX, centerY, radius, startAngle + (dangerPercentage / 100) * totalAngle, endAngle)}
          fill="none"
          stroke="rgba(239, 68, 68, 0.15)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active value arc */}
        {percentage > 0 && (
          <path
            d={describeArc(centerX, centerY, radius, startAngle, currentAngle)}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter={`url(#glow-${sensorKey})`}
            className="gauge-arc-active"
          />
        )}

        {/* Value text */}
        <text
          x={centerX}
          y={centerY - 8}
          textAnchor="middle"
          className="gauge-value-text"
          fill={activeColor}
        >
          {value != null ? Math.round(value) : '--'}
        </text>
        <text
          x={centerX}
          y={centerY + 14}
          textAnchor="middle"
          className="gauge-unit-text"
          fill="rgba(255,255,255,0.5)"
        >
          {unit}
        </text>

        {/* Min / Max labels */}
        <text x="28" y="145" className="gauge-minmax-text" fill="rgba(255,255,255,0.3)">
          {min}
        </text>
        <text x="172" y="145" className="gauge-minmax-text" fill="rgba(255,255,255,0.3)" textAnchor="end">
          {max}
        </text>
      </svg>
      <div className="gauge-label">{label}</div>
    </div>
  );
}
