import React from 'react';
import { Calendar, ChevronRight, ChevronLeft, MoreHorizontal, AlertCircle } from 'lucide-react';

const PRIORITY_STYLES = {
  urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  medium: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const STATUS_ORDER = ['todo', 'in_progress', 'review', 'done'];

export const TaskCard = ({ task, onEdit, onMoveStatus }) => {
  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const currentStatusIndex = STATUS_ORDER.indexOf(task.status);
  const canMoveLeft = currentStatusIndex > 0;
  const canMoveRight = currentStatusIndex < STATUS_ORDER.length - 1;

  const handleMoveLeft = (e) => {
    e.stopPropagation();
    if (canMoveLeft) {
      onMoveStatus(task._id, STATUS_ORDER[currentStatusIndex - 1]);
    }
  };

  const handleMoveRight = (e) => {
    e.stopPropagation();
    if (canMoveRight) {
      onMoveStatus(task._id, STATUS_ORDER[currentStatusIndex + 1]);
    }
  };

  return (
    <div
      onClick={() => onEdit(task)}
      className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2.5 relative"
    >
      {/* Header: Priority & Quick Move Buttons */}
      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wide ${
            PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
          }`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {canMoveLeft && (
            <button
              onClick={handleMoveLeft}
              title="Move to previous column"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={handleMoveRight}
              title="Move to next column"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Task Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: Due date & Assignee */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {task.dueDate ? (
          <div
            className={`flex items-center gap-1.5 ${
              isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {isOverdue ? <AlertCircle className="w-3 h-3 text-rose-400" /> : <Calendar className="w-3 h-3" />}
            <span className="text-[11px]">
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        ) : (
          <div />
        )}

        {task.creator && (
          <div
            title={`Created by ${task.creator.name}`}
            className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-bold flex items-center justify-center uppercase"
          >
            {task.creator.name ? task.creator.name.slice(0, 1) : 'U'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
