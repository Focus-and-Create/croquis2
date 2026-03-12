"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageRecord } from "@/lib/types";

interface ImageGridProps {
  images: (ImageRecord & { url: string })[];
  onDelete: (image: ImageRecord) => void;
}

export function ImageGrid({ images, onDelete }: ImageGridProps) {
  const [viewImage, setViewImage] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border bg-secondary"
            onClick={() => setViewImage(image.url)}
          >
            <img
              src={image.url}
              alt={image.file_name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image);
              }}
              className={cn(
                "absolute right-1 top-1 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100 cursor-pointer"
              )}
              title="이미지 삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Full-size image viewer */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setViewImage(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-lg bg-black/60 p-2 text-white hover:bg-black/80 cursor-pointer"
            onClick={() => setViewImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={viewImage}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  );
}
