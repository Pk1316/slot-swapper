import express from 'express';  
import { protect } from '../middleware/Auth.js';
import ctrl from '../controllers/eventController.js';
const router = express.Router();

// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');
// const ctrl = require('../controllers/eventController');

router.use(protect);
router.post('/', ctrl.createEvent);
router.get('/', ctrl.getMyEvents);
router.patch('/:id', ctrl.updateEvent);
router.delete('/:id', ctrl.deleteEvent);

export default router;
