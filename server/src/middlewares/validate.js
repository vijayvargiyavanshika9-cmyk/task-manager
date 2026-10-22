import { AppError } from '../utils/AppError.js';

/**
 * Middleware factory for validating incoming requests against a Zod schema
 * @param {import('zod').ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Assign sanitized data back to request
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (err) {
    if (err.errors) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.slice(1).join('.'), // Remove top level 'body', 'query', or 'params'
        message: e.message,
      }));
      return next(new AppError('Validation failed', 400, formattedErrors));
    }
    next(err);
  }
};

export default validate;
