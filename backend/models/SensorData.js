const mongoose = require('mongoose');

/**
 * Mongoose schema for sensor data readings.
 * Each document represents a single reading from the sensor array.
 */
const sensorDataSchema = new mongoose.Schema(
  {
    temperature: {
      type: Number,
      required: [true, 'Temperature reading is required'],
    },
    humidity: {
      type: Number,
      required: [true, 'Humidity reading is required'],
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
      required: [true, 'MQ135 (air quality) reading is required'],
    },
    flame: {
      type: Boolean,
      required: [true, 'Flame detection status is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index on createdAt for efficient time-range queries
sensorDataSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
