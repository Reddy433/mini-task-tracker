"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import TaskForm from "@/components/TaskForm";
import FilterBar from "@/components/FilterBar";
import TaskCard from "@/components/TaskCard";
import * as api from "@/lib/api";
import type { CreateTaskInput, StatusFilter, Task } from "@/lib/types";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Initial load: fetch the full list once; filtering/search happen client-side
  // for instant feedback. (The API also supports ?status= & ?q= server-side.)
  useEffect(() => {
    let active = true;
    api
      .fetchTasks("all", "")
      .then((data) => active && setTasks(data))
      .catch((err) => active && setLoadError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      open: tasks.filter((t) => t.status === "open").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }),
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const statusOk = status === "all" || task.status === status;
      const queryOk = q.length === 0 || task.title.toLowerCase().includes(q);
      return statusOk && queryOk;
    });
  }, [tasks, status, query]);

  async function handleCreate(input: CreateTaskInput) {
    const created = await api.createTask(input);
    setTasks((prev) => [created, ...prev]);
  }

  async function handleToggle(task: Task) {
    const nextStatus = task.status === "open" ? "completed" : "open";
    setBusyId(task.id);
    // Optimistic update, reconciled with the server response.
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );
    try {
      const updated = await api.updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch {
      // Roll back on failure.
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(task: Task) {
    setBusyId(task.id);
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await api.deleteTask(task.id);
    } catch {
      setTasks(snapshot); // restore on failure
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Header counts={counts} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <TaskForm onCreate={handleCreate} />
        </div>

        <section aria-label="Task list">
          <div className="mb-5">
            <FilterBar
              status={status}
              onStatusChange={setStatus}
              query={query}
              onQueryChange={setQuery}
              counts={counts}
            />
          </div>

          {loading && (
            <div className="space-y-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white/60"
                />
              ))}
            </div>
          )}

          {loadError && !loading && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Could not load tasks: {loadError}
            </p>
          )}

          {!loading && !loadError && visibleTasks.length === 0 && (
            <EmptyState hasTasks={tasks.length > 0} query={query} />
          )}

          {!loading && !loadError && visibleTasks.length > 0 && (
            <ul className="space-y-3">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  busy={busyId === task.id}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function EmptyState({
  hasTasks,
  query,
}: {
  hasTasks: boolean;
  query: string;
}) {
  let message: string;
  if (!hasTasks) {
    message = "No tasks yet. Add your first task above to get started.";
  } else if (query.trim()) {
    message = `No tasks match “${query.trim()}”.`;
  } else {
    message = "No tasks in this view.";
  }
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M9 11l3 3 8-8" />
          <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
        </svg>
      </span>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
