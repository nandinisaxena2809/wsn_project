/**
 * Sensor threshold configuration.
 * Used for gauge coloring and alert triggers.
 */
export const THRESHOLDS = {
  temperature: {
    unit: '°C',
    min: 0,
    max: 100,
    warning: 45,
    danger: 60,
    label: 'Temperature',
    icon: '🌡️',
  },
  humidity: {
    unit: '%',
    min: 0,
    max: 100,
    warning: 80,
    danger: 95,
    label: 'Humidity',
    icon: '💧',
  },
  mq2: {
    unit: 'ppm',
    min: 0,
    max: 1000,
    warning: 300,
    danger: 500,
    label: 'MQ2 (Smoke)',
    icon: '💨',
  },
  mq7: {
    unit: 'ppm',
    min: 0,
    max: 500,
    warning: 100,
    danger: 200,
    label: 'MQ7 (CO)',
    icon: '☁️',
  },
  mq135: {
    unit: 'ppm',
    min: 0,
    max: 800,
    warning: 200,
    danger: 400,
    label: 'MQ135 (Air)',
    icon: '🌬️',
  },
};

/**
 * Determine alert status for a given sensor value.
 * @param {string} sensorKey - Key from THRESHOLDS
 * @param {number} value - Current sensor value
 * @returns {'safe'|'warning'|'danger'}
 */
export function getStatus(sensorKey, value) {
  const t = THRESHOLDS[sensorKey];
  if (!t) return 'safe';
  if (value >= t.danger) return 'danger';
  if (value >= t.warning) return 'warning';
  return 'safe';
}

/**
 * Get all active alerts from a sensor reading.
 * @param {Object} data - Sensor data object
 * @returns {Array<{type: string, message: string, level: string}>}
 */
export function getAlerts(data) {
  if (!data) return [];
  const alerts = [];

  if (data.flame === true) {
    alerts.push({
      type: 'flame',
      message: '🔥 FIRE ALERT! Flame Detected!',
      level: 'danger',
    });
  }

  Object.keys(THRESHOLDS).forEach((key) => {
    const status = getStatus(key, data[key]);
    if (status === 'danger') {
      alerts.push({
        type: key,
        message: `⚠️ DANGER: ${THRESHOLDS[key].label} critically high (${data[key]}${THRESHOLDS[key].unit})`,
        level: 'danger',
      });
    } else if (status === 'warning') {
      alerts.push({
        type: key,
        message: `⚡ WARNING: ${THRESHOLDS[key].label} elevated (${data[key]}${THRESHOLDS[key].unit})`,
        level: 'warning',
      });
    }
  });

  return alerts;
}
