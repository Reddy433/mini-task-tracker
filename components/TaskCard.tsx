"use client";

import type { Task, TaskPriority } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface Props {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  busy: boolean;
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-sky-100 text-sky-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

export default function TaskCard({ task, onToggle, onDelete, busy }: Props) {
  const completed = task.status === "completed";

  return (
    <li
      className={`rounded-xl border p-4 shadow-sm transition ${
        completed
          ? "border-slate-200 bg-slate-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={completed}
          disabled={busy}
          onChange={() => onToggle(task)}
          aria-label={
            completed ? "Mark task as open" : "Mark task as completed"
          }
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-slate-900 disabled:cursor-not-allowed"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-medium ${
                completed
                  ? "text-slate-400 line-through"
                  : "text-slate-800"
              }`}
            >
              {task.title}
            </h3>

            {task.priority && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  PRIORITY_STYLES[task.priority]
                }`}
              >
                {task.priority}
              </span>
            )}

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                completed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {completed ? "Completed" : "Open"}
            </span>
          </div>

          {task.description && (
            <p
              className={`mt-1 whitespace-pre-wrap text-sm ${
                completed ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>Created {formatDate(task.createdAt)}</span>
            {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
          </div>
        </div>

        <button
          onClick={() => onDelete(task)}
          disabled={busy}
          aria-label="Delete task"
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
