import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Project title is required' })
      .trim()
      .min(2, 'Project title must be at least 2 characters long')
      .max(100, 'Project title cannot exceed 100 characters'),
    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .optional()
      .default(''),
    color: z
      .string()
      .regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Please provide a valid hex color code')
      .optional()
      .default('#4f46e5'),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    title: z
      .string()
      .trim()
      .min(2, 'Project title must be at least 2 characters long')
      .max(100, 'Project title cannot exceed 100 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    color: z
      .string()
      .regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Please provide a valid hex color code')
      .optional(),
  }),
});
