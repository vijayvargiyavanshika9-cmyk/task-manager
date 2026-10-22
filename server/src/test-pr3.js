import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import * as authService from './services/auth.service.js';
import * as projectService from './services/project.service.js';
import * as taskService from './services/task.service.js';

async function runPR3Tests() {
  console.log('🧪 Starting PR 3 Advanced Features (Search, Filters & Comments) Integration Tests...\n');

  try {
    await connectDB();

    const timestamp = Date.now();
    const userAData = await authService.registerUser({
      name: 'Analytics Lead',
      email: `analytics_${timestamp}@example.com`,
      password: 'Password123!',
    });

    const userBData = await authService.registerUser({
      name: 'Reviewer B',
      email: `reviewer_${timestamp}@example.com`,
      password: 'Password123!',
    });

    const userAId = userAData.user.id;
    const userBId = userBData.user.id;

    // Create Project
    const project = await projectService.createProject(
      {
        title: 'Q4 Product Roadmap',
        description: 'Tracking high priority releases and metrics',
        color: '#059669',
      },
      userAId
    );

    // Create Sample Tasks
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3); // 3 days overdue

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const task1 = await taskService.createTask(
      project._id,
      {
        title: 'Implement MongoDB Aggregation Pipeline for Analytics',
        description: 'Facet queries for status and priority metrics',
        status: 'done',
        priority: 'high',
        dueDate: futureDate,
      },
      userAId
    );

    const task2 = await taskService.createTask(
      project._id,
      {
        title: 'Fix Database Connection Pool Leak',
        description: 'Investigate socket hang up issues',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: pastDate, // Overdue
      },
      userAId
    );

    const task3 = await taskService.createTask(
      project._id,
      {
        title: 'Design Filter Toolbar in React',
        description: 'Add debounce hook for text search and priority pills',
        status: 'todo',
        priority: 'medium',
        dueDate: futureDate,
      },
      userAId
    );

    // Test 1: Search by Text Keyword
    console.log("Test 1: Searching tasks with keyword 'Aggregation'...");
    const searchResults = await taskService.searchTasks(
      project._id,
      { q: 'Aggregation' },
      userAId
    );
    if (searchResults.length !== 1 || searchResults[0].title !== task1.title) {
      throw new Error(`Text search failed. Expected 1 match, got ${searchResults.length}`);
    }
    console.log('✅ Test 1 Passed: Keyword search returned matching task accurately.');

    // Test 2: Filter by Priority and Status
    console.log("Test 2: Filtering tasks by priority 'urgent' and status 'in_progress'...");
    const filterResults = await taskService.searchTasks(
      project._id,
      { priority: 'urgent', status: 'in_progress' },
      userAId
    );
    if (filterResults.length !== 1 || filterResults[0]._id.toString() !== task2._id.toString()) {
      throw new Error('Priority and status filter failed');
    }
    console.log('✅ Test 2 Passed: Multi-criteria filter returned accurate subset.');

    // Test 3: Task Comments Creation
    console.log('Test 3: Adding comments to task...');
    const comment = await taskService.addComment(
      task1._id,
      'Great work on the aggregation pipeline! Performance is under 15ms.',
      userAId
    );
    if (!comment._id || comment.content.length === 0) {
      throw new Error('Failed to create comment');
    }
    console.log('✅ Test 3 Passed: Comment successfully added with author population.');

    // Test 4: Comment Authorization on Delete
    console.log('Test 4: Verifying User B cannot delete User A comment...');
    try {
      await taskService.deleteComment(task1._id, comment._id, userBId);
      throw new Error('User B should not be permitted to delete User A comment!');
    } catch (err) {
      if (err.statusCode === 403) {
        console.log('✅ Test 4 Passed: Unauthorized comment deletion rejected with HTTP 403.');
      } else {
        throw err;
      }
    }

    // Test 5: Author Deletes Comment
    console.log('Test 5: Author deletes comment...');
    const deleteResult = await taskService.deleteComment(task1._id, comment._id, userAId);
    if (!deleteResult.deleted) {
      throw new Error('Failed to delete comment');
    }
    console.log('✅ Test 5 Passed: Comment deleted successfully.');

    // Cleanup
    await projectService.deleteProject(project._id, userAId);
    await User.deleteMany({ _id: { $in: [userAId, userBId] } });
    console.log('✅ Test data cleaned up.');

    console.log('\n🎉 ALL 5 PR 3 ADVANCED FEATURES (SEARCH, FILTERS & COMMENTS) TESTS PASSED SUCCESSFULLY!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

runPR3Tests();
