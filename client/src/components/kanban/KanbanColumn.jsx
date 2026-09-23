import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';

export const KanbanColumn = ({
  status,
  title,
  tasks,
  colorDot,
  onTaskClick,
  onDragStart,
  onDropTask,
  onQuickAdd,
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    onDropTask(e, status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-80 flex-shrink-0 rounded-2xl bg-slate-900/70 border transition-all duration-200 ${
        isOver
          ? 'border-brand-500 bg-brand-950/20 ring-2 ring-brand-500/20'
          : 'border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colorDot}`} />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {title}
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onQuickAdd(status)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards List */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2.5 min-h-[350px]">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={onTaskClick}
            onDragStart={onDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-xs text-slate-500">
            Drag tasks here
          </div>
        )}
      </div>
    </div>
  );
};
