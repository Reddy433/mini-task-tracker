"use client";

import { useState } from "react";
import type { CreateTaskInput, TaskPriority } from "@/lib/types";
import { TITLE_MAX } from "@/lib/validation";

interface Props {
  onCreate: (input: CreateTaskInput) => Promise<void>;
}

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

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
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      noValidate
    >
      <h2 className="mb-4 text-base font-semibold text-slate-800">
        Add a task
      </h2>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="title"
            className="mb-1 block text-sm font-medium text-slate-700"
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            aria-invalid={Boolean(error)}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional details"
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label
              htmlFor="priority"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as TaskPriority | "")
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">None</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="dueDate"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Due date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add task"}
        </button>
      </div>
    </form>
  );
}
