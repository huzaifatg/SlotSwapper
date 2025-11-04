import express from 'express';
import { getMyEvents, createEvent, updateEventStatus, deleteEvent } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All event routes are protected
router.use(protect);

router.get('/mine', getMyEvents);
router.post('/', createEvent);
router.put('/:id/status', updateEventStatus);
router.delete('/:id', deleteEvent);

export default router;
