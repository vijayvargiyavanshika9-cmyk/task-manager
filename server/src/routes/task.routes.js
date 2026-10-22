import { Router } from 'express';
import {
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  deleteComment,
} from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  updateTaskSchema,
  updateTaskStatusSchema,
  addCommentSchema,
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

// Task comments endpoints
router.post('/:id/comments', validate(addCommentSchema), addComment);
router.delete('/:id/comments/:commentId', deleteComment);

export default router;
