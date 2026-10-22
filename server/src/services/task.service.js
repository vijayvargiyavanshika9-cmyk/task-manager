import mongoose from 'mongoose';
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
    .populate('comments.author', 'name email avatar')
    .sort({ order: 1, createdAt: -1 });
};

/**
 * Dynamic search & multi-criteria filtering for project tasks
 */
export const searchTasks = async (projectId, { q, status, priority, dueDateFrom, dueDateTo }, userId) => {
  await verifyProjectAccess(projectId, userId);

  const query = { project: projectId };

  // Partial case-insensitive text match across title and description
  if (q && q.trim()) {
    query.$or = [
      { title: { $regex: q.trim(), $options: 'i' } },
      { description: { $regex: q.trim(), $options: 'i' } },
    ];
  }

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (dueDateFrom || dueDateTo) {
    query.dueDate = {};
    if (dueDateFrom) query.dueDate.$gte = new Date(dueDateFrom);
    if (dueDateTo) query.dueDate.$lte = new Date(dueDateTo);
  }

  return Task.find(query)
    .populate('creator', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .populate('comments.author', 'name email avatar')
    .sort({ order: 1, createdAt: -1 });
};

/**
 * Create a new task within a project
 */
export const createTask = async (projectId, taskData, userId) => {
  await verifyProjectAccess(projectId, userId);

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
    { path: 'comments.author', select: 'name email avatar' },
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
    { path: 'comments.author', select: 'name email avatar' },
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

/**
 * Add a comment to a task
 */
export const addComment = async (taskId, content, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  await verifyProjectAccess(task.project, userId);

  task.comments.push({
    author: userId,
    content,
  });

  await task.save();
  await task.populate('comments.author', 'name email avatar');

  return task.comments[task.comments.length - 1];
};

/**
 * Delete a comment from a task
 */
export const deleteComment = async (taskId, commentId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  const project = await verifyProjectAccess(task.project, userId);

  const comment = task.comments.id(commentId);
  if (!comment) {
    throw new AppError('Comment not found.', 404);
  }

  // Allow deletion if user is comment author OR project owner
  const isAuthor = comment.author.toString() === userId.toString();
  const isOwner = project.owner.toString() === userId.toString();

  if (!isAuthor && !isOwner) {
    throw new AppError('You do not have permission to delete this comment.', 403);
  }

  comment.deleteOne();
  await task.save();

  return { commentId, deleted: true };
};

/**
 * Project Analytics Aggregation Pipeline
 */
export const getProjectAnalytics = async (projectId, userId) => {
  await verifyProjectAccess(projectId, userId);

  const projectObjectId = new mongoose.Types.ObjectId(projectId);

  const [analyticsResult] = await Task.aggregate([
    { $match: { project: projectObjectId } },
    {
      $facet: {
        total: [{ $count: 'count' }],
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        overdue: [
          {
            $match: {
              status: { $ne: 'done' },
              dueDate: { $lt: new Date(), $ne: null },
            },
          },
          { $count: 'count' },
        ],
      },
    },
  ]);

  const totalTasks = analyticsResult?.total?.[0]?.count || 0;
  const overdueTasks = analyticsResult?.overdue?.[0]?.count || 0;

  const statusMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
  (analyticsResult?.byStatus || []).forEach((item) => {
    if (statusMap[item._id] !== undefined) {
      statusMap[item._id] = item.count;
    }
  });

  const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
  (analyticsResult?.byPriority || []).forEach((item) => {
    if (priorityMap[item._id] !== undefined) {
      priorityMap[item._id] = item.count;
    }
  });

  const completedTasks = statusMap.done || 0;
  const inProgressTasks = statusMap.in_progress || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    completionRate,
    byStatus: statusMap,
    byPriority: priorityMap,
  };
};
