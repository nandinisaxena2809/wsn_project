const SensorData = require('../models/SensorData');

/**
 * Service layer for sensor data database operations.
 * Keeps database logic isolated from controllers.
 */
const sensorService = {
  /**
   * Create a new sensor data record.
   * @param {Object} data - Validated sensor data
   * @returns {Promise<Object>} Created document
   */
  async create(data) {
    const sensorData = new SensorData(data);
    return await sensorData.save();
  },

  /**
   * Get the most recent sensor reading.
   * @returns {Promise<Object|null>} Latest sensor document
   */
  async getLatest() {
    return await SensorData.findOne().sort({ createdAt: -1 }).lean();
  },

  /**
   * Get historical sensor data with optional time-range filtering.
   * @param {Object} options
   * @param {number} options.limit - Max number of records to return
   * @param {Date} [options.from] - Start of time range
   * @param {Date} [options.to] - End of time range
   * @returns {Promise<Array>} Array of sensor documents
   */
  async getHistory({ limit = 100, from, to } = {}) {
    const query = {};

    // Build time-range filter if provided
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    return await SensorData.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 1000)) // Cap at 1000 to prevent abuse
      .lean();
  },

  /**
   * Get all records in a time range for CSV export.
   * @param {Object} options
   * @param {Date} [options.from] - Start date
   * @param {Date} [options.to] - End date
   * @returns {Promise<Array>} Array of sensor documents
   */
  async getForExport({ from, to } = {}) {
    const query = {};
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    return await SensorData.find(query)
      .sort({ createdAt: -1 })
      .limit(5000) // Safety cap for exports
      .lean();
  },
};

module.exports = sensorService;
