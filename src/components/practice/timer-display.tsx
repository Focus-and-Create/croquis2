"use client";

import { formatTime, cn } from "@/lib/utils";

interface TimerDisplayProps {
  timeRemaining: number;
  totalTime: number;
}

export function TimerDisplay({ timeRemaining, totalTime }: TimerDisplayProps) {
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;
  const isWarning = timeRemaining <= 10;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Progress bar at top of screen */}
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-white/10">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            isWarning ? "bg-red-500" : "bg-primary"
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Timer text */}
      <span
        className={cn(
          "text-4xl font-mono font-bold tabular-nums transition-colors",
          isWarning ? "text-red-500" : "text-white/60"
        )}
      >
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}
