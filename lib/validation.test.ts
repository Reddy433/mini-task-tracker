import { describe, expect, it } from "vitest";
import {
  normalizeCreateInput,
  validateCreateTask,
  TITLE_MAX,
} from "./validation";

describe("validateCreateTask", () => {
  it("accepts a task with a non-empty title", () => {
    expect(validateCreateTask({ title: "Buy milk" }).ok).toBe(true);
  });

  it("rejects a missing title", () => {
    const result = validateCreateTask({ description: "no title" });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Title is required.");
  });

  it("rejects a whitespace-only title", () => {
    const result = validateCreateTask({ title: "   " });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Title is required.");
  });

  it("rejects a non-object body", () => {
    expect(validateCreateTask("nope").ok).toBe(false);
    expect(validateCreateTask(null).ok).toBe(false);
  });

  it("rejects an overly long title", () => {
    const result = validateCreateTask({ title: "a".repeat(TITLE_MAX + 1) });
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = validateCreateTask({ title: "ok", priority: "urgent" });
    expect(result.ok).toBe(false);
  });

  it("accepts a valid priority", () => {
    expect(validateCreateTask({ title: "ok", priority: "high" }).ok).toBe(
      true
    );
  });
});

describe("normalizeCreateInput", () => {
  it("trims title and description and defaults fields", () => {
    const result = normalizeCreateInput({
      title: "  Hello  ",
      description: "  world  ",
    });
    expect(result.title).toBe("Hello");
    expect(result.description).toBe("world");
    expect(result.dueDate).toBeNull();
    expect(result.priority).toBeUndefined();
  });

  it("keeps a valid priority and dueDate", () => {
    const result = normalizeCreateInput({
      title: "x",
      priority: "low",
      dueDate: "2026-07-01",
    });
    expect(result.priority).toBe("low");
    expect(result.dueDate).toBe("2026-07-01");
  });
});
