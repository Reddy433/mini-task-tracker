"use client";

import { useEffect, useMemo, useState } from "react";
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
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Mini Task Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create tasks, mark them done, and filter or search your list.
        </p>
      </header>

      <div className="mb-8">
        <TaskForm onCreate={handleCreate} />
      </div>

      <section aria-label="Task list">
        <div className="mb-4">
          <FilterBar
            status={status}
            onStatusChange={setStatus}
            query={query}
            onQueryChange={setQuery}
            counts={counts}
          />
        </div>

        {loading && (
          <p className="py-12 text-center text-sm text-slate-400">
            Loading tasks…
          </p>
        )}

        {loadError && !loading && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
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
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
