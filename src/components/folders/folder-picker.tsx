"use client";

import { Check, FolderIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder } from "@/lib/types";

interface FolderPickerProps {
  folders: (Folder & { image_count: number })[];
  selectedIds: string[];
  onToggle: (folderId: string) => void;
}

export function FolderPicker({ folders, selectedIds, onToggle }: FolderPickerProps) {
  const totalImages = folders
    .filter((f) => selectedIds.includes(f.id))
    .reduce((sum, f) => sum + f.image_count, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          폴더 선택 <span className="text-destructive">*</span>
        </label>
        {selectedIds.length > 0 && (
          <span className="text-xs text-muted-foreground">
            총 {totalImages}장 선택됨
          </span>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {folders.map((folder) => {
          const isSelected = selectedIds.includes(folder.id);
          return (
            <button
              key={folder.id}
              onClick={() => onToggle(folder.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </div>
              <FolderIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-medium text-foreground">
                {folder.name}
              </span>
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                {folder.image_count}
              </span>
            </button>
          );
        })}
      </div>
      {folders.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          폴더가 없습니다. 먼저 대시보드에서 폴더를 만들어주세요.
        </p>
      )}
    </div>
  );
}
