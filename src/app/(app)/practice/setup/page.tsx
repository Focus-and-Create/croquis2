"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getFolders, getImageCountByFolder } from "@/lib/storage";
import { useSessionStore } from "@/stores/session-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FolderPicker } from "@/components/folders/folder-picker";
import { cn } from "@/lib/utils";
import type { Folder } from "@/lib/types";
import { ArrowLeft, Play, Timer, Hash } from "lucide-react";

const TIMER_PRESETS = [
  { label: "1분", seconds: 60 },
  { label: "2분", seconds: 120 },
  { label: "3분", seconds: 180 },
  { label: "5분", seconds: 300 },
  { label: "10분", seconds: 600 },
];

const COUNT_PRESETS = [5, 10, 15, 20];

export default function PracticeSetupPage() {
  const router = useRouter();
  const setConfig = useSessionStore((s) => s.setConfig);

  const [folders, setFolders] = useState<(Folder & { image_count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [customTimer, setCustomTimer] = useState("");
  const [isCustomTimer, setIsCustomTimer] = useState(false);
  const [totalRounds, setTotalRounds] = useState(10);
  const [customRounds, setCustomRounds] = useState("");
  const [isCustomRounds, setIsCustomRounds] = useState(false);
  const [useAllImages, setUseAllImages] = useState(false);

  const totalAvailableImages = folders
    .filter((f) => selectedFolderIds.includes(f.id))
    .reduce((sum, f) => sum + f.image_count, 0);

  const fetchFolders = useCallback(() => {
    const raw = getFolders();
    const withCounts = raw.map((folder) => ({
      ...folder,
      image_count: getImageCountByFolder(folder.id),
    }));
    setFolders(withCounts.filter((f) => f.image_count > 0));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleToggleFolder = (folderId: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleStart = () => {
    const seconds = isCustomTimer ? parseInt(customTimer) * 60 : timerSeconds;
    const rounds = useAllImages
      ? -1
      : isCustomRounds
        ? parseInt(customRounds)
        : totalRounds;

    if (!seconds || seconds <= 0) return;
    if (!useAllImages && (!rounds || rounds <= 0)) return;
    if (selectedFolderIds.length === 0) return;

    setConfig({
      folderIds: selectedFolderIds,
      timerSeconds: seconds,
      totalRounds: rounds,
    });

    router.push("/practice/session");
  };

  const canStart =
    selectedFolderIds.length > 0 &&
    totalAvailableImages > 0 &&
    (isCustomTimer ? parseInt(customTimer) > 0 : timerSeconds > 0) &&
    (useAllImages || (isCustomRounds ? parseInt(customRounds) > 0 : totalRounds > 0));

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">연습 설정</h1>
      </div>

      <FolderPicker
        folders={folders}
        selectedIds={selectedFolderIds}
        onToggle={handleToggleFolder}
      />

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Timer className="h-4 w-4" />
          시간 설정
        </label>
        <div className="flex flex-wrap gap-2">
          {TIMER_PRESETS.map((preset) => (
            <button
              key={preset.seconds}
              onClick={() => {
                setTimerSeconds(preset.seconds);
                setIsCustomTimer(false);
              }}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                !isCustomTimer && timerSeconds === preset.seconds
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:border-muted-foreground/50"
              )}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setIsCustomTimer(true)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              isCustomTimer
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:border-muted-foreground/50"
            )}
          >
            커스텀
          </button>
        </div>
        {isCustomTimer && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              placeholder="시간 입력"
              value={customTimer}
              onChange={(e) => setCustomTimer(e.target.value)}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">분</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Hash className="h-4 w-4" />
          장수 선택
        </label>
        <div className="flex flex-wrap gap-2">
          {COUNT_PRESETS.map((count) => (
            <button
              key={count}
              onClick={() => {
                setTotalRounds(count);
                setIsCustomRounds(false);
                setUseAllImages(false);
              }}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                !isCustomRounds && !useAllImages && totalRounds === count
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:border-muted-foreground/50"
              )}
            >
              {count}장
            </button>
          ))}
          <button
            onClick={() => {
              setUseAllImages(true);
              setIsCustomRounds(false);
            }}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              useAllImages
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:border-muted-foreground/50"
            )}
          >
            전체
          </button>
          <button
            onClick={() => {
              setIsCustomRounds(true);
              setUseAllImages(false);
            }}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              isCustomRounds
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:border-muted-foreground/50"
            )}
          >
            커스텀
          </button>
        </div>
        {isCustomRounds && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              placeholder="장수 입력"
              value={customRounds}
              onChange={(e) => setCustomRounds(e.target.value)}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">장</span>
          </div>
        )}
        {selectedFolderIds.length > 0 && (
          <p className="text-xs text-muted-foreground">
            선택된 폴더에 총 {totalAvailableImages}장의 이미지가 있습니다
          </p>
        )}
      </div>

      <Button
        onClick={handleStart}
        disabled={!canStart}
        size="lg"
        className="w-full text-base"
      >
        <Play className="h-5 w-5" />
        연습 시작
      </Button>
    </div>
  );
}
