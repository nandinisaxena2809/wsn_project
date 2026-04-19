const mongoose = require('mongoose');

/**
 * Mongoose schema for sensor data readings.
 * Each document represents a single reading from the sensor array.
 *
 * Required fields: temperature, mq2, mq7 (what the hardware actually sends)
 * Optional fields: humidity, mq135, flame (default to safe values if not available)
 */
const sensorDataSchema = new mongoose.Schema(
  {
    temperature: {
      type: Number,
      required: [true, 'Temperature reading is required'],
    },
    humidity: {
      type: Number,
      default: 0,
    },
    mq2: {
      type: Number,
      required: [true, 'MQ2 (smoke/gas) reading is required'],
    },
    mq7: {
      type: Number,
      required: [true, 'MQ7 (carbon monoxide) reading is required'],
    },
    mq135: {
      type: Number,
      default: 0,
    },
    flame: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index on createdAt for efficient time-range queries
sensorDataSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
