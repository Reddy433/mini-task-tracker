import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { CreateTaskInput, Task, UpdateTaskInput } from "./types";

/**
 * Persistence layer.
 *
 * The app uses a single JSON document ("tasks") as its data source. Two
 * backends implement the same interface:
 *
 *   - Netlify Blobs   -> used automatically when running on Netlify.
 *   - Local JSON file -> used during `next dev` / local builds.
 *
 * A failure to reach Netlify Blobs degrades gracefully to an in-memory copy
 * so the app never hard-crashes (see getBlobStore).
 */

const BLOB_STORE_NAME = "task-tracker";
const BLOB_KEY = "tasks";
const LOCAL_FILE = path.join(process.cwd(), ".data", "tasks.json");

interface Backend {
  readAll(): Promise<Task[]>;
  writeAll(tasks: Task[]): Promise<void>;
}

const runningOnNetlify = Boolean(
  process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT
);

/* ------------------------------------------------------------------ */
/* Netlify Blobs backend                                              */
/* ------------------------------------------------------------------ */

let memoryFallback: Task[] | null = null;

async function getBlobBackend(): Promise<Backend> {
  const { getStore } = await import("@netlify/blobs");
  const store = getStore({ name: BLOB_STORE_NAME, consistency: "strong" });

  return {
    async readAll() {
      try {
        const data = await store.get(BLOB_KEY, { type: "json" });
        return (data as Task[]) ?? [];
      } catch {
        return memoryFallback ?? [];
      }
    },
    async writeAll(tasks) {
      memoryFallback = tasks;
      try {
        await store.setJSON(BLOB_KEY, tasks);
      } catch {
        // Keep the in-memory copy; the request still succeeds for the user.
      }
    },
  };
}

/* ------------------------------------------------------------------ */
/* Local file backend                                                 */
/* ------------------------------------------------------------------ */

function getFileBackend(): Backend {
  return {
    async readAll() {
      try {
        const raw = await fs.readFile(LOCAL_FILE, "utf8");
        return JSON.parse(raw) as Task[];
      } catch (err: unknown) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw err;
      }
    },
    async writeAll(tasks) {
      await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
      await fs.writeFile(LOCAL_FILE, JSON.stringify(tasks, null, 2), "utf8");
    },
  };
}

let backendPromise: Promise<Backend> | null = null;
function backend(): Promise<Backend> {
  if (!backendPromise) {
    backendPromise = runningOnNetlify
      ? getBlobBackend()
      : Promise.resolve(getFileBackend());
  }
  return backendPromise;
}

/* ------------------------------------------------------------------ */
/* Public data-access API                                             */
/* ------------------------------------------------------------------ */

function sortByNewest(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listTasks(): Promise<Task[]> {
  const b = await backend();
  return sortByNewest(await b.readAll());
}

export async function getTask(id: string): Promise<Task | null> {
  const b = await backend();
  const tasks = await b.readAll();
  return tasks.find((t) => t.id === id) ?? null;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const b = await backend();
  const tasks = await b.readAll();
  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? "",
    status: "open",
    priority: input.priority,
    dueDate: input.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await b.writeAll([task, ...tasks]);
  return task;
}

export async function updateTask(
  id: string,
  patch: UpdateTaskInput
): Promise<Task | null> {
  const b = await backend();
  const tasks = await b.readAll();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const existing = tasks[index];
  const updated: Task = {
    ...existing,
    ...("title" in patch && patch.title !== undefined
      ? { title: patch.title.trim() }
      : {}),
    ...("description" in patch && patch.description !== undefined
      ? { description: patch.description }
      : {}),
    ...("status" in patch && patch.status !== undefined
      ? { status: patch.status }
      : {}),
    ...("priority" in patch ? { priority: patch.priority } : {}),
    ...("dueDate" in patch ? { dueDate: patch.dueDate ?? null } : {}),
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  await b.writeAll(tasks);
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  const b = await backend();
  const tasks = await b.readAll();
  const next = tasks.filter((t) => t.id !== id);
  if (next.length === tasks.length) return false;
  await b.writeAll(next);
  return true;
}
