const sensorService = require('../services/sensorService');
const { Parser } = require('json2csv');

/**
 * Controller for sensor data endpoints.
 * Handles HTTP request/response logic, delegates to service layer.
 */
const sensorController = {
  /**
   * POST /api/sensor-data
   * Ingest new sensor reading and broadcast via Socket.IO
   */
  async createReading(req, res, next) {
    try {
      const data = req.validatedBody;
      const saved = await sensorService.create(data);

      // Broadcast to all connected clients via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('newSensorData', saved);
      }

      res.status(201).json({
        success: true,
        data: saved,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/sensor-data/latest
   * Returns the most recent sensor reading
   */
  async getLatest(req, res, next) {
    try {
      const latest = await sensorService.getLatest();

      if (!latest) {
        return res.status(404).json({
          success: false,
          error: 'No sensor data available',
        });
      }

      res.json({
        success: true,
        data: latest,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/sensor-data/history
   * Returns historical sensor data (supports ?limit, ?from, ?to)
   */
  async getHistory(req, res, next) {
    try {
      const { limit = 100, from, to } = req.query;

      const history = await sensorService.getHistory({
        limit: parseInt(limit, 10),
        from,
        to,
      });

      res.json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/sensor-data/export/csv
   * Downloads sensor data as a CSV file
   */
  async exportCSV(req, res, next) {
    try {
      const { from, to } = req.query;
      const data = await sensorService.getForExport({ from, to });

      if (!data.length) {
        return res.status(404).json({
          success: false,
          error: 'No data to export',
        });
      }

      const fields = [
        'temperature',
        'mq2',
        'mq7',
        'createdAt',
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=sensor_data.csv'
      );
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = sensorController;
