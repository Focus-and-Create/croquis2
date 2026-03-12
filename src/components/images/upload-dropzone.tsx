"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface UploadDropzoneProps {
  folderId: string;
  onUploaded: () => void;
}

export function UploadDropzone({ folderId, onUploaded }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );

      if (imageFiles.length === 0) {
        setError("이미지 파일만 업로드할 수 있습니다");
        return;
      }

      const oversized = imageFiles.filter((f) => f.size > 10 * 1024 * 1024);
      if (oversized.length > 0) {
        setError("파일 크기는 10MB 이하여야 합니다");
        return;
      }

      setError("");
      setUploading(true);
      setUploadCount({ done: 0, total: imageFiles.length });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("로그인이 필요합니다");
        setUploading(false);
        return;
      }

      for (const file of imageFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const uuid = crypto.randomUUID();
        const storagePath = `${user.id}/${folderId}/${uuid}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("reference-images")
          .upload(storagePath, file);

        if (uploadError) {
          setError(`업로드 실패: ${file.name}`);
          continue;
        }

        await supabase.from("images").insert({
          user_id: user.id,
          folder_id: folderId,
          file_name: file.name,
          storage_path: storagePath,
        });

        setUploadCount((prev) => ({ ...prev, done: prev.done + 1 }));
      }

      setUploading(false);
      onUploaded();
    },
    [folderId, supabase, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {uploading ? (
        <>
          <Spinner size={32} />
          <p className="text-sm text-muted-foreground">
            업로드 중... ({uploadCount.done}/{uploadCount.total})
          </p>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              이미지를 드래그하거나{" "}
              <button
                onClick={() => inputRef.current?.click()}
                className="font-medium text-primary hover:underline cursor-pointer"
              >
                파일 선택
              </button>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WEBP (최대 10MB)
            </p>
          </div>
        </>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
