import React, { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'In Review' },
  { id: 'done', title: 'Done' },
];

export const KanbanBoard = ({
  project,
  tasks = [],
  onCreateTask,
  onUpdateTask,
  onMoveTaskStatus,
  onDeleteTask,
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState('todo');

  const handleOpenCreate = (columnId = 'todo') => {
    setSelectedTask(null);
    setModalDefaultStatus(columnId);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSave = async (taskData) => {
    if (selectedTask) {
      await onUpdateTask(selectedTask._id, taskData);
    } else {
      await onCreateTask(taskData);
    }
  };

  return (
    <div className="w-full">
      {/* 4-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={columnTasks}
              onAddTask={handleOpenCreate}
              onEditTask={handleOpenEdit}
              onMoveTaskStatus={onMoveTaskStatus}
            />
          );
        })}
      </div>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={onDeleteTask}
        initialData={selectedTask}
        defaultStatus={modalDefaultStatus}
      />
    </div>
  );
};

export default KanbanBoard;
