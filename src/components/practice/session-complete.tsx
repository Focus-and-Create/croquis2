"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, RotateCcw, Home } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface SessionCompleteProps {
  totalImages: number;
  timerSeconds: number;
  onRestart: () => void;
  onHome: () => void;
}

export function SessionComplete({
  totalImages,
  timerSeconds,
  onRestart,
  onHome,
}: SessionCompleteProps) {
  const totalTime = totalImages * timerSeconds;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <div>
          <h2 className="text-3xl font-bold text-white">연습 완료!</h2>
          <p className="mt-2 text-lg text-white/60">수고하셨습니다</p>
        </div>

        <div className="flex gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-white">{totalImages}</p>
            <p className="text-sm text-white/50">장</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {formatTime(timerSeconds)}
            </p>
            <p className="text-sm text-white/50">장당 시간</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {formatTime(totalTime)}
            </p>
            <p className="text-sm text-white/50">총 소요시간</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRestart}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4" />
            다시 시작
          </Button>
          <Button
            onClick={onHome}
            className="bg-white text-black hover:bg-white/90"
          >
            <Home className="h-4 w-4" />
            홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}
