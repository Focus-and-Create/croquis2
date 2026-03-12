"use client";

import { Pause, Play, SkipForward, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionControlsProps {
  isPaused: boolean;
  visible: boolean;
  onTogglePause: () => void;
  onSkip: () => void;
  onStop: () => void;
}

export function SessionControls({
  isPaused,
  visible,
  onTogglePause,
  onSkip,
  onStop,
}: SessionControlsProps) {
  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-black/70 px-6 py-3 backdrop-blur-sm transition-opacity duration-300",
        visible || isPaused ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <button
        onClick={onStop}
        className="rounded-xl p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
        title="종료 (Esc)"
      >
        <X className="h-6 w-6" />
      </button>

      <button
        onClick={onTogglePause}
        className="rounded-xl bg-white/20 p-4 text-white transition-colors hover:bg-white/30 cursor-pointer"
        title="일시정지/재개 (Space)"
      >
        {isPaused ? (
          <Play className="h-7 w-7" />
        ) : (
          <Pause className="h-7 w-7" />
        )}
      </button>

      <button
        onClick={onSkip}
        className="rounded-xl p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
        title="다음 (→)"
      >
        <SkipForward className="h-6 w-6" />
      </button>
    </div>
  );
}
