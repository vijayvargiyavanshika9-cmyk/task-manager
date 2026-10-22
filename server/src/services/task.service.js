import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { AppError } from '../utils/AppError.js';

/**
 * Helper to verify user has access to a project
 */
const verifyProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  const isOwner = project.owner.toString() === userId.toString();
  const isMember = project.members.some((m) => m.toString() === userId.toString());

  if (!isOwner && !isMember) {
    throw new AppError('You do not have access to this project.', 403);
  }

  return project;
};

/**
 * Fetch all tasks for a project grouped or sorted by column and order
 */
export const getTasksByProject = async (projectId, userId) => {
  await verifyProjectAccess(projectId, userId);

  return Task.find({ project: projectId })
    .populate('creator', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .sort({ order: 1, createdAt: -1 });
};

/**
 * Create a new task within a project
 */
export const createTask = async (projectId, taskData, userId) => {
  await verifyProjectAccess(projectId, userId);

  // Determine current highest order in that column to append cleanly
  const lastTask = await Task.findOne({
    project: projectId,
    status: taskData.status || 'todo',
  }).sort({ order: -1 });

  const nextOrder = lastTask ? lastTask.order + 1 : 0;

  const task = await Task.create({
    ...taskData,
    project: projectId,
    creator: userId,
    order: taskData.order !== undefined ? taskData.order : nextOrder,
  });

  return task.populate([
    { path: 'creator', select: 'name email avatar' },
    { path: 'assignedTo', select: 'name email avatar' },
  ]);
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId, updateData, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  await verifyProjectAccess(task.project, userId);

  const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo', 'order'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      task[field] = updateData[field];
    }
  });

  await task.save();

  return task.populate([
    { path: 'creator', select: 'name email avatar' },
    { path: 'assignedTo', select: 'name email avatar' },
  ]);
};

/**
 * Lightweight endpoint to move a task between status columns or reorder
 */
export const updateTaskStatus = async (taskId, { status, order }, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  await verifyProjectAccess(task.project, userId);

  task.status = status;
  if (order !== undefined) {
    task.order = order;
  }

  await task.save();

  return task.populate([
    { path: 'creator', select: 'name email avatar' },
    { path: 'assignedTo', select: 'name email avatar' },
  ]);
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  await verifyProjectAccess(task.project, userId);

  await Task.findByIdAndDelete(taskId);

  return { taskId, deleted: true };
};
