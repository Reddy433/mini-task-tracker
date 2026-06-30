"use client";

import { useState } from "react";
import type { CreateTaskInput, TaskPriority } from "@/lib/types";
import { TITLE_MAX } from "@/lib/validation";

interface Props {
  onCreate: (input: CreateTaskInput) => Promise<void>;
}

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

// Note: text-base (16px) on mobile prevents iOS Safari from auto-zooming —
// and shifting the whole layout — when an input is focused. sm:text-sm keeps
// the tighter 14px on larger screens where tap-zoom isn't a concern.
const inputBase =
  "block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:text-sm";

export default function TaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Client-side mirror of the server rule: title is required.
    if (title.trim().length === 0) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        priority: priority || undefined,
        dueDate: dueDate || null,
      });
      setTitle("");
      setDescription("");
      setPriority("");
      setDueDate("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 sm:p-6"
      noValidate
    >
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <h2 className="text-base font-semibold text-slate-800">Add a task</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Left column: title + description */}
        <div className="min-w-0 space-y-4 md:col-span-2">
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Write project README"
              className={`${inputBase} ${
                error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""
              }`}
              aria-invalid={Boolean(error)}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional details, links, or notes…"
              className={`${inputBase} resize-y`}
            />
          </div>
        </div>

        {/* Right column: priority, due date, submit */}
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <label
              htmlFor="priority"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority | "")}
              className={`${inputBase} cursor-pointer capitalize`}
            >
              <option value="">None</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Due date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${inputBase} cursor-pointer`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add task"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-rose-600"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </form>
  );
}
