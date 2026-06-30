import { NextRequest, NextResponse } from "next/server";
import { createTask, listTasks } from "@/lib/store";
import { normalizeCreateInput, validateCreateTask } from "@/lib/validation";
import type { StatusFilter, Task } from "@/lib/types";

// Always run dynamically; this route reads/writes a data store.
export const dynamic = "force-dynamic";

function applyFilters(
  tasks: Task[],
  status: StatusFilter,
  query: string
): Task[] {
  const q = query.trim().toLowerCase();
  return tasks.filter((task) => {
    const statusOk = status === "all" || task.status === status;
    const queryOk = q.length === 0 || task.title.toLowerCase().includes(q);
    return statusOk && queryOk;
  });
}

// GET /api/tasks?status=all|open|completed&q=searchTerm
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const statusParam = (params.get("status") ?? "all") as StatusFilter;
  const status: StatusFilter = ["all", "open", "completed"].includes(
    statusParam
  )
    ? statusParam
    : "all";
  const query = params.get("q") ?? "";

  const tasks = await listTasks();
  return NextResponse.json({ tasks: applyFilters(tasks, status, query) });
}

// POST /api/tasks  -> create a task
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: ["Request body must be valid JSON."] },
      { status: 400 }
    );
  }

  const result = validateCreateTask(body);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const task = await createTask(
    normalizeCreateInput(body as Record<string, unknown>)
  );
  return NextResponse.json({ task }, { status: 201 });
}
