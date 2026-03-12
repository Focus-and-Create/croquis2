"use client";

import Link from "next/link";
import { Folder as FolderIcon, ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder } from "@/lib/types";

interface FolderCardProps {
  folder: Folder;
  onDelete: (id: string) => void;
}

export function FolderCard({ folder, onDelete }: FolderCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/50">
      <Link href={`/folders?id=${folder.id}`} className="block p-5">
        <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-secondary">
          {folder.thumbnail_url ? (
            <img
              src={folder.thumbnail_url}
              alt={folder.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <FolderIcon className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <h3 className="font-medium text-card-foreground truncate">{folder.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <ImageIcon className="h-3 w-3" />
          <span>{folder.image_count ?? 0}장</span>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(folder.id);
        }}
        className={cn(
          "absolute right-2 top-2 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 cursor-pointer"
        )}
        title="폴더 삭제"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
