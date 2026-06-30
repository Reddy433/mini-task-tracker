import type {
  CreateTaskInput,
  StatusFilter,
  Task,
  UpdateTaskInput,
} from "./types";

/** Thrown when the API responds with a non-2xx status. */
export class ApiError extends Error {
  errors: string[];
  constructor(errors: string[]) {
    super(errors[0] ?? "Request failed.");
    this.errors = errors;
  }
}

async function parseError(res: Response): Promise<never> {
  let errors = [`Request failed (${res.status}).`];
  try {
    const data = await res.json();
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      errors = data.errors;
    }
  } catch {
    // keep default
  }
  throw new ApiError(errors);
}

export async function fetchTasks(
  status: StatusFilter,
  query: string
): Promise<Task[]> {
  const params = new URLSearchParams({ status });
  if (query.trim()) params.set("q", query.trim());
  const res = await fetch(`/api/tasks?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  const data = await res.json();
  return data.tasks as Task[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  const data = await res.json();
  return data.task as Task;
}

export async function updateTask(
  id: string,
  patch: UpdateTaskInput
): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) await parseError(res);
  const data = await res.json();
  return data.task as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) await parseError(res);
}
