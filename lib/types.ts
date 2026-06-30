export type TaskStatus = "open" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape accepted when creating a task (server fills the rest). */
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
}

/** Shape accepted when updating a task. All fields optional. */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export const STATUS_FILTERS = ["all", "open", "completed"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];