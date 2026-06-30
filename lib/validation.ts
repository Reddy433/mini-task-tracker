import type { CreateTaskInput, TaskPriority } from "./types";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];
export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/**
 * Validates the payload for creating a task.
 * Rule from the spec: title is required and must not be empty.
 */
export function validateCreateTask(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: ["Request body must be an object."] };
  }

  const { title, description, priority } = input as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0) {
    errors.push("Title is required.");
  } else if (title.trim().length > TITLE_MAX) {
    errors.push(`Title must be ${TITLE_MAX} characters or fewer.`);
  }

  if (description !== undefined && typeof description !== "string") {
    errors.push("Description must be a string.");
  } else if (
    typeof description === "string" &&
    description.length > DESCRIPTION_MAX
  ) {
    errors.push(`Description must be ${DESCRIPTION_MAX} characters or fewer.`);
  }

  if (
    priority !== undefined &&
    !PRIORITIES.includes(priority as TaskPriority)
  ) {
    errors.push("Priority must be one of: low, medium, high.");
  }

  return { ok: errors.length === 0, errors };
}

export function isPriority(value: unknown): value is TaskPriority {
  return PRIORITIES.includes(value as TaskPriority);
}

/** Normalises a validated create payload into a clean object. */
export function normalizeCreateInput(input: Record<string, unknown>): CreateTaskInput {
  return {
    title: String(input.title).trim(),
    description:
      typeof input.description === "string" ? input.description.trim() : "",
    priority: isPriority(input.priority) ? input.priority : undefined,
    dueDate:
      typeof input.dueDate === "string" && input.dueDate.trim().length > 0
        ? input.dueDate
        : null,
  };
}
