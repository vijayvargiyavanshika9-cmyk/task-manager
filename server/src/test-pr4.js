import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import * as authService from './services/auth.service.js';
import * as projectService from './services/project.service.js';
import * as taskService from './services/task.service.js';

async function runPR4AnalyticsTests() {
  console.log('🧪 Starting PR 4 Project Analytics Aggregation Pipeline Integration Tests...\n');

  try {
    await connectDB();

    const timestamp = Date.now();
    const user = await authService.registerUser({
      name: 'Analytics Lead',
      email: `analytics_${timestamp}@example.com`,
      password: 'Password123!',
    });

    const userId = user.user.id;

    // Create Project
    const project = await projectService.createProject(
      {
        title: 'Q4 Product Roadmap Analytics',
        description: 'Tracking high priority releases and aggregation metrics',
        color: '#059669',
      },
      userId
    );

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3); // 3 days overdue

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    // Create Sample Tasks
    await taskService.createTask(
      project._id,
      {
        title: 'Implement MongoDB Aggregation Pipeline for Analytics',
        description: 'Facet queries for status and priority metrics',
        status: 'done',
        priority: 'high',
        dueDate: futureDate,
      },
      userId
    );

    await taskService.createTask(
      project._id,
      {
        title: 'Fix Database Connection Pool Leak',
        description: 'Investigate socket hang up issues',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: pastDate, // Overdue
      },
      userId
    );

    await taskService.createTask(
      project._id,
      {
        title: 'Design Analytics Dashboard in React',
        description: 'Add metric cards and status progress bars',
        status: 'todo',
        priority: 'medium',
        dueDate: futureDate,
      },
      userId
    );

    // Test: Aggregation Analytics Pipeline
    console.log('Testing project analytics aggregation pipeline ($facet)...');
    const analytics = await taskService.getProjectAnalytics(project._id, userId);

    if (analytics.totalTasks !== 3) {
      throw new Error(`Expected 3 total tasks, got ${analytics.totalTasks}`);
    }
    if (analytics.completedTasks !== 1) {
      throw new Error(`Expected 1 completed task, got ${analytics.completedTasks}`);
    }
    if (analytics.completionRate !== 33) {
      throw new Error(`Expected 33% completion rate, got ${analytics.completionRate}%`);
    }
    if (analytics.overdueTasks !== 1) {
      throw new Error(`Expected 1 overdue task, got ${analytics.overdueTasks}`);
    }
    if (analytics.byPriority.urgent !== 1 || analytics.byPriority.high !== 1) {
      throw new Error('Priority facet aggregation counts mismatch');
    }
    console.log('✅ Passed: Aggregation pipeline computed total, completion %, overdue, and facets accurately.');

    // Cleanup
    await projectService.deleteProject(project._id, userId);
    await User.findByIdAndDelete(userId);
    console.log('✅ Test data cleaned up.');

    console.log('\n🎉 ALL PR 4 ANALYTICS TESTS PASSED SUCCESSFULLY!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

runPR4AnalyticsTests();
