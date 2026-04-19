const Joi = require('joi');

/**
 * Joi validation schema for incoming sensor data.
 * Only temperature, mq2, mq7 are required (matches partners' hardware).
 * humidity, mq135, flame are optional — will use defaults if not sent.
 */
const sensorDataSchema = Joi.object({
  temperature: Joi.number().min(-50).max(150).required()
    .messages({ 'any.required': 'Temperature is required' }),
  humidity: Joi.number().min(0).max(100).optional().default(0),
  mq2: Joi.number().min(0).max(10000).required()
    .messages({ 'any.required': 'MQ2 reading is required' }),
  mq7: Joi.number().min(0).max(10000).required()
    .messages({ 'any.required': 'MQ7 reading is required' }),
  mq135: Joi.number().min(0).max(10000).optional().default(0),
  flame: Joi.boolean().optional().default(false),
  timestamp: Joi.date().iso().optional(),
});

/**
 * Express middleware factory that validates request body against a Joi schema.
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages,
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = {
  validateSensorData: validateBody(sensorDataSchema),
};
