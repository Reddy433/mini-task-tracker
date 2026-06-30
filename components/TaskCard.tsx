"use client";

import type { Task, TaskPriority } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface Props {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  busy: boolean;
}

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  low: "bg-sky-100 text-sky-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

const PRIORITY_ACCENT: Record<TaskPriority, string> = {
  low: "before:bg-sky-400",
  medium: "before:bg-amber-400",
  high: "before:bg-rose-400",
};

export default function TaskCard({ task, onToggle, onDelete, busy }: Props) {
  const completed = task.status === "completed";
  const accent = task.priority ? PRIORITY_ACCENT[task.priority] : "before:bg-slate-200";

  return (
    <li
      className={`animate-card-in group relative overflow-hidden rounded-2xl border p-4 pl-5 shadow-sm transition before:absolute before:inset-y-0 before:left-0 before:w-1 ${accent} ${
        completed
          ? "border-slate-200 bg-slate-50/80"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/60"
      } ${busy ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Custom completion toggle */}
        <button
          type="button"
          onClick={() => onToggle(task)}
          disabled={busy}
          aria-label={completed ? "Mark task as open" : "Mark task as completed"}
          aria-pressed={completed}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition disabled:cursor-not-allowed ${
            completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 bg-white hover:border-emerald-400"
          }`}
        >
          {completed && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-medium ${
                completed ? "text-slate-400 line-through" : "text-slate-800"
              }`}
            >
              {task.title}
            </h3>

            {task.priority && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_BADGE[task.priority]}`}
              >
                {task.priority}
              </span>
            )}

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                completed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
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

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
              Created {formatDate(task.createdAt)}
            </span>
            {task.dueDate && (
              <span className="inline-flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" />
                </svg>
                Due {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(task)}
          disabled={busy}
          aria-label="Delete task"
          title="Delete task"
          className="shrink-0 rounded-lg p-1.5 text-slate-400 opacity-100 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 disabled:cursor-not-allowed sm:opacity-0 sm:group-hover:opacity-100"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </li>
  );
}
