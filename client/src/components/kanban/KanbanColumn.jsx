import React from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const COLUMN_COLORS = {
  todo: 'bg-sky-500',
  in_progress: 'bg-amber-500',
  review: 'bg-purple-500',
  done: 'bg-emerald-500',
};

export const KanbanColumn = ({
  column,
  tasks = [],
  onAddTask,
  onEditTask,
  onMoveTaskStatus,
}) => {
  return (
    <div className="flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${COLUMN_COLORS[column.id] || 'bg-slate-500'}`} />
          <h3 className="text-sm font-bold text-white tracking-wide">{column.title}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(column.id)}
          title={`Add task to ${column.title}`}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards List */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onMoveStatus={onMoveTaskStatus}
            />
          ))
        ) : (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            <span>No tasks</span>
            <button
              onClick={() => onAddTask(column.id)}
              className="mt-1.5 text-indigo-400 hover:text-indigo-300 font-medium text-[11px]"
            >
              + Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
