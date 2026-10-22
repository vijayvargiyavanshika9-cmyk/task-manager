import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';
import env from '../config/env.js';

/**
 * Protect middleware: Ensures the request carries a valid Bearer JWT
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check httpOnly cookie first (browser client)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Bearer token header (API/mobile/tests)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Authentication required. Please log in to access this resource.', 401)
    );
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token signature. Authentication failed.', 401));
  }

  // Verify user still exists in database
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user account associated with this token no longer exists.', 401)
    );
  }

  // Attach user to request object
  req.user = currentUser.toJSON();
  next();
});

export default protect;
