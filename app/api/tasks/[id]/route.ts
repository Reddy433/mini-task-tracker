import { NextRequest, NextResponse } from "next/server";
import { deleteTask, getTask, updateTask } from "@/lib/store";
import { isPriority } from "@/lib/validation";
import type { UpdateTaskInput } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

// GET /api/tasks/:id
export async function GET(_request: NextRequest, { params }: Params) {
  const task = await getTask(params.id);
  if (!task) {
    return NextResponse.json({ errors: ["Task not found."] }, { status: 404 });
  }
  return NextResponse.json({ task });
}

// PATCH /api/tasks/:id  -> update fields (e.g. mark completed, edit, set priority)
export async function PATCH(request: NextRequest, { params }: Params) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: ["Request body must be valid JSON."] },
      { status: 400 }
    );
  }

  const errors: string[] = [];
  const patch: UpdateTaskInput = {};
  const input = body as Record<string, unknown>;

  if ("title" in input) {
    if (typeof input.title !== "string" || input.title.trim().length === 0) {
      errors.push("Title must not be empty.");
    } else {
      patch.title = input.title;
    }
  }
  if ("description" in input) {
    if (typeof input.description !== "string") {
      errors.push("Description must be a string.");
    } else {
      patch.description = input.description;
    }
  }
  if ("status" in input) {
    if (input.status !== "open" && input.status !== "completed") {
      errors.push("Status must be 'open' or 'completed'.");
    } else {
      patch.status = input.status;
    }
  }
  if ("priority" in input) {
    if (input.priority === null || isPriority(input.priority)) {
      patch.priority = input.priority === null ? undefined : input.priority;
    } else {
      errors.push("Priority must be one of: low, medium, high.");
    }
  }
  if ("dueDate" in input) {
    if (input.dueDate === null || typeof input.dueDate === "string") {
      patch.dueDate = (input.dueDate as string | null) ?? null;
    } else {
      errors.push("dueDate must be a string or null.");
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const task = await updateTask(params.id, patch);
  if (!task) {
    return NextResponse.json({ errors: ["Task not found."] }, { status: 404 });
  }
  return NextResponse.json({ task });
}

// DELETE /api/tasks/:id
export async function DELETE(_request: NextRequest, { params }: Params) {
  const ok = await deleteTask(params.id);
  if (!ok) {
    return NextResponse.json({ errors: ["Task not found."] }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
