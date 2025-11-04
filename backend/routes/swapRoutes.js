import express from 'express';
import {
  getSwappableSlots,
  initiateSwap,
  respondToSwap,
  getIncomingSwaps,
  getOutgoingSwaps
} from '../controllers/swapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All swap routes are protected
router.use(protect);

router.get('/swappable-slots', getSwappableSlots);
router.post('/swap-request', initiateSwap);
router.post('/swap-response/:requestId', respondToSwap);
router.get('/swaps/incoming', getIncomingSwaps);
router.get('/swaps/outgoing', getOutgoingSwaps);

export default router;
