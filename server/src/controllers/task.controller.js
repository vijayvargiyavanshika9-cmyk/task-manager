import { asyncHandler } from '../utils/asyncHandler.js';
import * as taskService from '../services/task.service.js';

export const getTasksByProject = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasksByProject(req.params.projectId, req.user.id);
  res.status(200).json({
    success: true,
    data: tasks,
  });
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.params.projectId, req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: task,
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    data: task,
  });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status, order } = req.body;
  const task = await taskService.updateTaskStatus(req.params.id, { status, order }, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Task status updated.',
    data: task,
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Task deleted successfully.',
  });
});
