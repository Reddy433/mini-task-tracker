"use client";

import { STATUS_FILTERS, type StatusFilter } from "@/lib/types";

interface Props {
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  query: string;
  onQueryChange: (query: string) => void;
  counts: Record<StatusFilter, number>;
}

const LABELS: Record<StatusFilter, string> = {
  all: "All",
  open: "Open",
  completed: "Completed",
};

export default function FilterBar({
  status,
  onStatusChange,
  query,
  onQueryChange,
  counts,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Filter tasks by status"
        className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
      >
        {STATUS_FILTERS.map((value) => {
          const active = status === value;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={active}
              onClick={() => onStatusChange(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {LABELS[value]}
              <span
                className={`ml-1.5 text-xs ${
                  active ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {counts[value]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative sm:w-64">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by title…"
          aria-label="Search tasks by title"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>
    </div>
  );
}
