import { asyncHandler } from '../utils/asyncHandler.js';
import * as projectService from '../services/project.service.js';

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjects(req.user.id);
  res.status(200).json({
    success: true,
    data: projects,
  });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    data: project,
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Project created successfully.',
    data: project,
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Project updated successfully.',
    data: project,
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Project and associated tasks deleted successfully.',
  });
});
