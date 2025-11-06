//const Joi = require('joi');
import Joi from 'joi';

// Example usage:
// const schema = Joi.object({ name: Joi.string().required(), age: Joi.number().min(0) });
// app.post('/some-route', validateBody(schema), (req, res) => { ... });
export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
