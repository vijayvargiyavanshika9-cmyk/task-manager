import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import * as authService from './services/auth.service.js';
import * as projectService from './services/project.service.js';
import * as taskService from './services/task.service.js';

async function runKanbanTests() {
  console.log('🧪 Starting PR 2 Core Domain (Projects & Kanban Tasks) Integration Tests...\n');

  try {
    await connectDB();

    const timestamp = Date.now();
    const userAData = await authService.registerUser({
      name: 'Kanban Lead A',
      email: `lead_a_${timestamp}@example.com`,
      password: 'Password123!',
    });

    const userBData = await authService.registerUser({
      name: 'Kanban Dev B',
      email: `dev_b_${timestamp}@example.com`,
      password: 'Password123!',
    });

    const userAId = userAData.user.id;
    const userBId = userBData.user.id;

    // Test 1: Create Project
    console.log('Test 1: Creating new Project for User A...');
    const project = await projectService.createProject(
      {
        title: 'Platform Redesign',
        description: 'Core web UI migration and Kanban workflow setup',
        color: '#6366f1',
      },
      userAId
    );
    if (!project._id || project.title !== 'Platform Redesign') {
      throw new Error('Project creation failed');
    }
    console.log('✅ Test 1 Passed: Project created with owner binding.');

    // Test 2: Multi-tenant Authorization Protection
    console.log("Test 2: Verifying User B cannot access User A's project...");
    try {
      await projectService.getProjectById(project._id, userBId);
      throw new Error('User B should not be allowed to access User A project!');
    } catch (err) {
      if (err.statusCode === 403) {
        console.log('✅ Test 2 Passed: Unauthorized project access rejected with HTTP 403.');
      } else {
        throw err;
      }
    }

    // Test 3: Create Tasks across Kanban Columns
    console.log('Test 3: Creating tasks across To Do, In Progress, Review, and Done columns...');
    const task1 = await taskService.createTask(
      project._id,
      {
        title: 'Design Kanban Card Components',
        description: 'Tailwind cards with priority badges and due date pills',
        status: 'todo',
        priority: 'high',
      },
      userAId
    );

    const task2 = await taskService.createTask(
      project._id,
      {
        title: 'Build Project REST APIs',
        description: 'Express controllers and Zod validation layers',
        status: 'in_progress',
        priority: 'urgent',
      },
      userAId
    );

    const task3 = await taskService.createTask(
      project._id,
      {
        title: 'Security Code Review',
        description: 'Verify httpOnly cookies and rate limiting',
        status: 'review',
        priority: 'medium',
      },
      userAId
    );

    const task4 = await taskService.createTask(
      project._id,
      {
        title: 'Initialize Docker Compose',
        description: 'MongoDB 7.0 container with volumes',
        status: 'done',
        priority: 'low',
      },
      userAId
    );

    const allTasks = await taskService.getTasksByProject(project._id, userAId);
    if (allTasks.length !== 4) {
      throw new Error(`Expected 4 tasks, got ${allTasks.length}`);
    }
    console.log(`✅ Test 3 Passed: 4 tasks created across columns with proper project binding.`);

    // Test 4: Task Status Transition (Kanban Move)
    console.log("Test 4: Moving task from 'todo' to 'in_progress'...");
    const updatedStatusTask = await taskService.updateTaskStatus(
      task1._id,
      { status: 'in_progress', order: 1 },
      userAId
    );
    if (updatedStatusTask.status !== 'in_progress') {
      throw new Error('Task status update failed');
    }
    console.log("✅ Test 4 Passed: Task status moved to 'in_progress' successfully.");

    // Test 5: Task Details Update
    console.log('Test 5: Updating task title and priority...');
    const updatedTask = await taskService.updateTask(
      task2._id,
      {
        title: 'Build Project REST APIs (Completed & Verified)',
        priority: 'high',
      },
      userAId
    );
    if (updatedTask.priority !== 'high') {
      throw new Error('Task update failed');
    }
    console.log('✅ Test 5 Passed: Task details updated successfully.');

    // Test 6: Cascade Delete Verification
    console.log('Test 6: Deleting project and verifying cascading deletion of all associated tasks...');
    await projectService.deleteProject(project._id, userAId);

    const remainingTasks = await Task.find({ project: project._id });
    if (remainingTasks.length !== 0) {
      throw new Error(`Cascade delete failed! Remaining tasks: ${remainingTasks.length}`);
    }
    console.log('✅ Test 6 Passed: Project deleted and all 4 child tasks cascade deleted cleanly.');

    // Cleanup users
    await User.deleteMany({ _id: { $in: [userAId, userBId] } });
    console.log('✅ Test users cleaned up.');

    console.log('\n🎉 ALL 6 PR 2 CORE DOMAIN TESTS PASSED SUCCESSFULLY!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

runKanbanTests();
