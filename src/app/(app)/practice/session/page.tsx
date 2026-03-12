"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSessionStore } from "@/stores/session-store";
import { TimerDisplay } from "@/components/practice/timer-display";
import { SessionControls } from "@/components/practice/session-controls";
import { SessionComplete } from "@/components/practice/session-complete";
import { Spinner } from "@/components/ui/spinner";
import { shuffleArray } from "@/lib/utils";
import type { ImageRecord } from "@/lib/types";

export default function PracticeSessionPage() {
  const router = useRouter();
  const supabase = createClient();

  const config = useSessionStore((s) => s.config);
  const images = useSessionStore((s) => s.images);
  const currentIndex = useSessionStore((s) => s.currentIndex);
  const timeRemaining = useSessionStore((s) => s.timeRemaining);
  const isPaused = useSessionStore((s) => s.isPaused);
  const isComplete = useSessionStore((s) => s.isComplete);
  const setImages = useSessionStore((s) => s.setImages);
  const tick = useSessionStore((s) => s.tick);
  const togglePause = useSessionStore((s) => s.togglePause);
  const skip = useSessionStore((s) => s.skip);
  const reset = useSessionStore((s) => s.reset);

  const [loading, setLoading] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch images on mount
  useEffect(() => {
    if (!config) {
      router.push("/practice/setup");
      return;
    }

    const fetchImages = async () => {
      const allImages: (ImageRecord & { url: string })[] = [];

      for (const folderId of config.folderIds) {
        const { data: imagesData } = await supabase
          .from("images")
          .select("*")
          .eq("folder_id", folderId);

        if (imagesData) {
          for (const img of imagesData) {
            const { data: urlData } = await supabase.storage
              .from("reference-images")
              .createSignedUrl(img.storage_path, 7200);
            allImages.push({
              ...img,
              url: urlData?.signedUrl || "",
            });
          }
        }
      }

      let shuffled = shuffleArray(allImages);

      // Limit to totalRounds if not -1 (all)
      if (config.totalRounds !== -1) {
        shuffled = shuffled.slice(0, config.totalRounds);
      }

      setImages(shuffled);
      setLoading(false);
    };

    fetchImages();
  }, [config, supabase, router, setImages]);

  // Timer interval
  useEffect(() => {
    if (loading || isComplete) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, isComplete, tick]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        togglePause();
      } else if (e.key === "ArrowRight") {
        skip();
      } else if (e.key === "Escape") {
        handleStop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePause, skip]);

  // Auto-hide controls
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => showControls();
    const handleTouch = () => showControls();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouch);

    // Show controls initially then auto-hide
    showControls();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen may not be available
      }
    };
    enterFullscreen();

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Preload next image
  useEffect(() => {
    if (currentIndex < images.length - 1) {
      const nextImg = new Image();
      nextImg.src = images[currentIndex + 1].url;
    }
  }, [currentIndex, images]);

  const handleStop = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    reset();
    router.push("/practice/setup");
  };

  const handleRestart = () => {
    if (config) {
      const shuffled = shuffleArray(images);
      setImages(shuffled);
    }
  };

  const handleHome = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    reset();
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} className="text-white" />
          <p className="text-white/60">이미지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-white">이미지가 없습니다</p>
          <button
            onClick={handleStop}
            className="text-primary hover:underline cursor-pointer"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <SessionComplete
        totalImages={images.length}
        timerSeconds={config?.timerSeconds ?? 0}
        onRestart={handleRestart}
        onHome={handleHome}
      />
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black cursor-none">
      {/* Progress indicator */}
      <div className="fixed right-4 top-4 z-40 text-sm font-mono text-white/40">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
          <p className="text-2xl font-bold text-white/80">일시정지</p>
        </div>
      )}

      {/* Reference image */}
      <img
        src={currentImage.url}
        alt=""
        className="max-h-screen max-w-screen object-contain"
        draggable={false}
      />

      {/* Timer */}
      <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2">
        <TimerDisplay
          timeRemaining={timeRemaining}
          totalTime={config?.timerSeconds ?? 0}
        />
      </div>

      {/* Controls */}
      <SessionControls
        isPaused={isPaused}
        visible={controlsVisible}
        onTogglePause={togglePause}
        onSkip={skip}
        onStop={handleStop}
      />
    </div>
  );
}
