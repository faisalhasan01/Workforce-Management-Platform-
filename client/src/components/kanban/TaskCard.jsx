import React from 'react';
import { CheckSquare, MessageSquare, Clock, User as UserIcon } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export const TaskCard = ({ task, onClick, onDragStart }) => {
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick(task)}
      className="p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800/90 border border-slate-750 hover:border-slate-650 cursor-grab active:cursor-grabbing transition-all shadow-subtle group"
    >
      {/* Top row: Key & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
          {task.key}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Task Title */}
      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-2 mb-2.5">
        {task.title}
      </h3>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Subtasks count, Comments count, Story Points, Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-400 text-xs">
        <div className="flex items-center space-x-3">
          {totalSubtasks > 0 && (
            <div
              className={`flex items-center space-x-1 ${
                completedSubtasks === totalSubtasks ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="text-[11px]">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {task.comments?.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[11px]">{task.comments.length}</span>
            </div>
          )}

          {task.storyPoints > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {task.storyPoints}pt
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignee ? (
          <img
            src={
              task.assignee.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(task.assignee.name)}`
            }
            alt={task.assignee.name}
            title={`Assigned to ${task.assignee.name}`}
            className="w-6 h-6 rounded-full border border-slate-700 object-cover"
          />
        ) : (
          <div
            className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500"
            title="Unassigned"
          >
            <UserIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};
