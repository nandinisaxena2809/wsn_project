const API_BASE = 'http://localhost:5000/api';

/**
 * Fetch the latest sensor reading from the API.
 * @returns {Promise<Object>} Latest sensor data
 */
export async function fetchLatest() {
  const res = await fetch(`${API_BASE}/sensor-data/latest`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch latest data');
  return json.data;
}

/**
 * Fetch historical sensor data.
 * @param {Object} params - Query parameters
 * @param {number} [params.limit=100] - Number of records
 * @param {string} [params.from] - ISO date string for range start
 * @param {string} [params.to] - ISO date string for range end
 * @returns {Promise<Array>} Array of sensor readings
 */
export async function fetchHistory({ limit = 100, from, to } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  const res = await fetch(`${API_BASE}/sensor-data/history?${params}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch history');
  return json.data;
}

/**
 * Get CSV export download URL.
 * @param {Object} [params] - Optional from/to date filters
 * @returns {string} Download URL
 */
export function getCSVExportURL({ from, to } = {}) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return `${API_BASE}/sensor-data/export/csv${qs ? '?' + qs : ''}`;
}
