import { create } from "zustand";
import type { SessionConfig, ImageRecord } from "@/lib/types";

interface SessionImage extends ImageRecord {
  url: string;
}

interface SessionState {
  config: SessionConfig | null;
  images: SessionImage[];
  currentIndex: number;
  timeRemaining: number;
  isPaused: boolean;
  isComplete: boolean;

  setConfig: (config: SessionConfig) => void;
  setImages: (images: SessionImage[]) => void;
  tick: () => void;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
  skip: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  config: null,
  images: [],
  currentIndex: 0,
  timeRemaining: 0,
  isPaused: false,
  isComplete: false,

  setConfig: (config) =>
    set({ config, timeRemaining: config.timerSeconds }),

  setImages: (images) =>
    set({ images, currentIndex: 0, isComplete: false }),

  tick: () => {
    const state = get();
    if (state.isPaused || state.isComplete) return;

    if (state.timeRemaining <= 1) {
      // Time's up, advance to next image
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.images.length) {
        set({ timeRemaining: 0, isComplete: true });
      } else {
        set({
          currentIndex: nextIndex,
          timeRemaining: state.config?.timerSeconds ?? 0,
        });
      }
    } else {
      set({ timeRemaining: state.timeRemaining - 1 });
    }
  },

  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  skip: () => {
    const state = get();
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.images.length) {
      set({ isComplete: true, timeRemaining: 0 });
    } else {
      set({
        currentIndex: nextIndex,
        timeRemaining: state.config?.timerSeconds ?? 0,
        isPaused: false,
      });
    }
  },

  reset: () =>
    set({
      config: null,
      images: [],
      currentIndex: 0,
      timeRemaining: 0,
      isPaused: false,
      isComplete: false,
    }),
}));
