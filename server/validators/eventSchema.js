//const Joi = require('joi');
import Joi from 'joi';
export const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(50).required(),
  startTime: Joi.date().required(),
  endTime: Joi.date().greater(Joi.ref('startTime')).required()
});
export const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(50),
  startTime: Joi.date(),
  endTime: Joi.date().greater(Joi.ref('startTime'))
}).min(1); // At least one field must be provided for update    