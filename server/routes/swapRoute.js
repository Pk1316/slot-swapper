import express from 'express';  
import { protect } from '../middleware/Auth.js';
import ctrl from '../controllers/swapController.js';
const router = express.Router();


router.use(protect);

router.get('/swappable-slots', ctrl.getSwappableSlots);
router.post('/swap-request', ctrl.createSwapRequest);
router.post('/swap-response/:requestId', ctrl.respondToSwap);
router.get('/my-requests', ctrl.getIncomingOutgoing);

export default router;
