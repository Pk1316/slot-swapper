import express from 'express';
import ctrl from '../controllers/AuthController.js';
const router = express.Router();

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);

export default router;
