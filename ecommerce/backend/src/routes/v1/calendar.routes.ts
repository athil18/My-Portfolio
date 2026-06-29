import { Router } from 'express';
import * as calendarController from '../../controllers/calendar.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', calendarController.createEvent);
router.get('/', calendarController.getEvents);
router.patch('/:id', calendarController.updateEvent);
router.delete('/:id', calendarController.deleteEvent);

export default router;
