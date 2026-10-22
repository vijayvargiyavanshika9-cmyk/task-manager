import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import env from '../config/env.js';

/**
 * Sign JWT token for user
 * @param {string} userId
 * @returns {string} signed JWT
 */
export const signToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = signToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Authenticate user with credentials
 */
export const loginUser = async ({ email, password }) => {
  // Explicitly include password because select: false is on schema
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Fetch user profile by ID
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User profile not found.', 404);
  }
  return user.toJSON();
};
