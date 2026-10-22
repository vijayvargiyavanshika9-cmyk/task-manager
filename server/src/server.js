import app from './app.js';
import env from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

// Catch uncaught exceptions before server starts
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down immediately...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

let server;

const startServer = async () => {
  try {
    // Attempt DB connection
    await connectDB();
  } catch (err) {
    console.warn('⚠️ Starting HTTP server without active DB connection (will retry or accept offline requests):', err.message);
  }

  server = app.listen(env.PORT, () => {
    console.log(`🚀 Task Manager API running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    console.log(`📡 Health check available at: http://localhost:${env.PORT}/api/health`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(err);
  if (server) {
    server.close(() => {
      disconnectDB().finally(() => process.exit(1));
    });
  } else {
    process.exit(1);
  }
});

// Handle termination signals (Docker, PM2, Ctrl+C)
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
