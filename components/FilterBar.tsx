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
        className="inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm shadow-slate-200/60"
      >
        {STATUS_FILTERS.map((value) => {
          const active = status === value;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={active}
              onClick={() => onStatusChange(value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {LABELS[value]}
              <span
                className={`inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[value]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative sm:w-72">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by title…"
          aria-label="Search tasks by title"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:text-sm"
        />
      </div>
    </div>
  );
}
