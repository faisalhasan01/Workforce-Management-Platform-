import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useOrg } from '../context/OrgContext';

export const CalendarPage = () => {
  const { activeOrg } = useOrg();
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const [tasksRes, sprintsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/sprints'),
        ]);

        if (tasksRes.data.success) setTasks(tasksRes.data.tasks);
        if (sprintsRes.data.success) setSprints(sprintsRes.data.sprints);
      } catch (err) {
        console.error('Failed to load schedule:', err);
      }
    };

    fetchSchedule();
  }, [activeOrg?._id]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Build calendar matrix
  const calendarCells = [];
  // Empty leading cells
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <CalendarIcon className="w-6 h-6 text-brand-400" />
            <span>Delivery Calendar & Milestones</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track upcoming sprint completions, release dates, and task deadlines.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-3 bg-slate-900 px-3.5 py-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-200 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Matrix */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-800 text-center py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-850/40">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 min-h-[500px]">
          {calendarCells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="bg-slate-950/40 p-2 min-h-[100px]" />;
            }

            const thisDate = new Date(year, month, day);
            const dateStr = thisDate.toISOString().split('T')[0];

            // Match tasks with dueDate on this day
            const dayTasks = tasks.filter((t) => {
              if (!t.dueDate) return false;
              return new Date(t.dueDate).toISOString().split('T')[0] === dateStr;
            });

            // Match sprints ending on this day
            const daySprints = sprints.filter((s) => {
              if (!s.endDate) return false;
              return new Date(s.endDate).toISOString().split('T')[0] === dateStr;
            });

            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`p-2.5 min-h-[110px] flex flex-col justify-between hover:bg-slate-850/30 transition-colors ${
                  isToday ? 'bg-brand-500/5' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                        : 'text-slate-300'
                    }`}
                  >
                    {day}
                  </span>

                  {(dayTasks.length > 0 || daySprints.length > 0) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  )}
                </div>

                {/* Events list */}
                <div className="mt-1.5 space-y-1 overflow-hidden">
                  {daySprints.map((s) => (
                    <div
                      key={s._id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate"
                      title={s.name}
                    >
                      🏁 Sprint End: {s.name}
                    </div>
                  ))}

                  {dayTasks.map((t) => (
                    <div
                      key={t._id}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border truncate ${
                        t.status === 'Done'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 line-through opacity-75'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      }`}
                      title={t.title}
                    >
                      [{t.key}] {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
