import { z } from 'zod';
import { TASK_STATUSES, TASK_PRIORITIES } from '../models/Task.js';

export const createTaskSchema = z.object({
  params: z.object({
    projectId: z.string().min(1, 'Project ID is required in URL path'),
  }),
  body: z.object({
    title: z
      .string({ required_error: 'Task title is required' })
      .trim()
      .min(1, 'Task title cannot be empty')
      .max(150, 'Task title cannot exceed 150 characters'),
    description: z.string().trim().optional().default(''),
    status: z.enum(TASK_STATUSES).optional().default('todo'),
    priority: z.enum(TASK_PRIORITIES).optional().default('medium'),
    dueDate: z.string().datetime({ offset: true }).nullable().optional(),
    assignedTo: z.string().nullable().optional(),
    order: z.number().int().optional().default(0),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Task title cannot be empty')
      .max(150, 'Task title cannot exceed 150 characters')
      .optional(),
    description: z.string().trim().optional(),
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    dueDate: z.string().nullable().optional(),
    assignedTo: z.string().nullable().optional(),
    order: z.number().int().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    status: z.enum(TASK_STATUSES, {
      required_error: 'Status is required (todo, in_progress, review, done)',
    }),
    order: z.number().int().optional(),
  }),
});
