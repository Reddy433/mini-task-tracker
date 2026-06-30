"use client";

import type { StatusFilter } from "@/lib/types";

interface Props {
  counts: Record<StatusFilter, number>;
}

export default function Header({ counts }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              Mini Task Tracker
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Plan it, track it, finish it.
            </p>
          </div>
        </div>

        {/* Live summary (counts also appear on the filter tabs, so hide on small screens) */}
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex sm:gap-2">
          <Stat label="Total" value={counts.all} tone="slate" />
          <Stat label="Open" value={counts.open} tone="indigo" />
          <Stat label="Done" value={counts.completed} tone="emerald" />
        </div>
      </div>
    </header>
  );
}

const TONES = {
  slate: "bg-slate-100 text-slate-700",
  indigo: "bg-indigo-50 text-indigo-700",
  emerald: "bg-emerald-50 text-emerald-700",
} as const;

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof TONES;
}) {
  return (
    <div
      className={`flex min-w-[3.25rem] flex-col items-center rounded-lg px-2.5 py-1 ${TONES[tone]}`}
    >
      <span className="text-sm font-bold leading-none tabular-nums sm:text-base">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80">
        {label}
      </span>
    </div>
  );
}
