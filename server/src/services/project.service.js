import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { AppError } from '../utils/AppError.js';

/**
 * List all projects owned by or shared with the user
 */
export const getProjects = async (userId) => {
  return Project.find({
    $or: [{ owner: userId }, { members: userId }],
  })
    .populate('owner', 'name email avatar')
    .sort({ updatedAt: -1 });
};

/**
 * Fetch a single project by ID with authorization verification
 */
export const getProjectById = async (projectId, userId) => {
  const project = await Project.findById(projectId).populate('owner', 'name email avatar');

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  // Check authorization
  const isOwner = project.owner._id.toString() === userId.toString();
  const isMember = project.members.some((m) => m.toString() === userId.toString());

  if (!isOwner && !isMember) {
    throw new AppError('You do not have permission to access this project.', 403);
  }

  return project;
};

/**
 * Create a new project
 */
export const createProject = async ({ title, description, color }, userId) => {
  const project = await Project.create({
    title,
    description,
    color,
    owner: userId,
  });

  return project.populate('owner', 'name email avatar');
};

/**
 * Update project details (Owner only)
 */
export const updateProject = async (projectId, updateData, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  if (project.owner.toString() !== userId.toString()) {
    throw new AppError('Only the project owner can update project details.', 403);
  }

  if (updateData.title !== undefined) project.title = updateData.title;
  if (updateData.description !== undefined) project.description = updateData.description;
  if (updateData.color !== undefined) project.color = updateData.color;

  await project.save();
  return project.populate('owner', 'name email avatar');
};

/**
 * Delete a project and cascade delete all its tasks (Owner only)
 */
export const deleteProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  if (project.owner.toString() !== userId.toString()) {
    throw new AppError('Only the project owner can delete this project.', 403);
  }

  // Cascade delete all tasks belonging to this project
  await Task.deleteMany({ project: projectId });

  // Delete project
  await Project.findByIdAndDelete(projectId);

  return { projectId, deleted: true };
};
