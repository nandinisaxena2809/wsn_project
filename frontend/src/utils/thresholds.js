/**
 * Sensor threshold configuration.
 * Updated for 3-sensor hardware: Temperature (DHT11), MQ2, MQ7.
 * MQ7 is a digital sensor (0 = safe, 1 = gas detected), so thresholds
 * are set accordingly (warning at 1, danger at 1).
 */
export const THRESHOLDS = {
  temperature: {
    unit: '°C',
    min: 0,
    max: 100,
    warning: 35,
    danger: 50,
    label: 'Temperature',
    icon: '🌡️',
  },
  mq2: {
    unit: 'ppm',
    min: 0,
    max: 1000,
    warning: 300,
    danger: 500,
    label: 'MQ2 (Smoke/LPG)',
    icon: '💨',
  },
  mq7: {
    unit: '',
    min: 0,
    max: 1,
    warning: 1,
    danger: 1,
    label: 'MQ7 (CO)',
    icon: '☁️',
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

  // MQ7 digital: 1 = gas detected
  if (data.mq7 === 1) {
    alerts.push({
      type: 'mq7',
      message: '☁️ CO ALERT! MQ7 Gas Detected!',
      level: 'danger',
    });
  }

  // Check all numeric sensor thresholds
  Object.keys(THRESHOLDS).forEach((key) => {
    if (key === 'mq7') return; // Already handled above
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
