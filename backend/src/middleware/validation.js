const Joi = require('joi');

// User validation schema
const userSchema = Joi.object({
  clerk_id: Joi.string().required(),
  username: Joi.string().min(1).max(50).required(),
  first_name: Joi.string().max(50).allow(null, '').optional(),
  last_name: Joi.string().max(50).allow(null, '').optional(),
  email: Joi.string().email().required(),
  level: Joi.number().integer().min(1).default(1),
  points: Joi.number().integer().min(0).default(0),
  streak: Joi.number().integer().min(0).default(0),
  total_minutes: Joi.number().integer().min(0).default(0)
}).unknown(true).options({ stripUnknown: false }); // Allow unknown fields and don't strip them

// Validation middleware
const validateUser = (req, res, next) => {
  console.log('Validating user data:', req.body);
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    console.log('Validation error:', error.details);
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  console.log('Validation passed, validated data:', value);
  req.body = value; // Use the validated data
  next();
};

module.exports = {
  validateUser
};
