import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import { getTasksByProject, createTask } from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../validators/project.validator.js';
import { createTaskSchema } from '../validators/task.validator.js';

const router = Router();

// Protect all project endpoints
router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(validate(createProjectSchema), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(validate(updateProjectSchema), updateProject)
  .delete(deleteProject);

// Nested tasks for project
router
  .route('/:projectId/tasks')
  .get(getTasksByProject)
  .post(validate(createTaskSchema), createTask);

export default router;
