const Joi = require('joi');

// User validation schema
const userSchema = Joi.object({
  clerk_id: Joi.string().required(),
  username: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  level: Joi.number().integer().min(1).default(1),
  points: Joi.number().integer().min(0).default(0),
  streak: Joi.number().integer().min(0).default(0),
  total_minutes: Joi.number().integer().min(0).default(0)
});

// Validation middleware
const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateUser
};
