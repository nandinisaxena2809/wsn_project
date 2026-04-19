const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { validateSensorData } = require('../middleware/validate');

// POST /api/sensor-data — Ingest new sensor reading
router.post('/', validateSensorData, sensorController.createReading);

// GET /api/sensor-data/latest — Get most recent reading
router.get('/latest', sensorController.getLatest);

// GET /api/sensor-data/history — Get historical data
router.get('/history', sensorController.getHistory);

// GET /api/sensor-data/export/csv — Download data as CSV
router.get('/export/csv', sensorController.exportCSV);

module.exports = router;
