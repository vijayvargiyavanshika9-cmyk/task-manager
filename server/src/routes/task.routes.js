import { Router } from 'express';
import {
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validator.js';

const router = Router();

// Protect all task endpoints
router.use(protect);

router
  .route('/:id')
  .put(validate(updateTaskSchema), updateTask)
  .delete(deleteTask);

router.patch(
  '/:id/status',
  validate(updateTaskStatusSchema),
  updateTaskStatus
);

export default router;
