"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UploadDropzone } from "@/components/images/upload-dropzone";
import { ImageGrid } from "@/components/images/image-grid";
import type { Folder, ImageRecord } from "@/lib/types";
import { ArrowLeft, ImageIcon, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function FolderDetailPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [images, setImages] = useState<(ImageRecord & { url: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const fetchData = useCallback(async () => {
    // Fetch folder
    const { data: folderData } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .single();

    if (!folderData) {
      router.push("/dashboard");
      return;
    }
    setFolder(folderData);

    // Fetch images
    const { data: imagesData } = await supabase
      .from("images")
      .select("*")
      .eq("folder_id", folderId)
      .order("created_at", { ascending: false });

    if (imagesData) {
      const imagesWithUrls = await Promise.all(
        imagesData.map(async (img) => {
          const { data } = await supabase.storage
            .from("reference-images")
            .createSignedUrl(img.storage_path, 3600);
          return { ...img, url: data?.signedUrl || "" };
        })
      );
      setImages(imagesWithUrls);
    }

    setLoading(false);
  }, [folderId, supabase, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteImage = async (image: ImageRecord) => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;

    await supabase.storage
      .from("reference-images")
      .remove([image.storage_path]);
    await supabase.from("images").delete().eq("id", image.id);

    setImages((prev) => prev.filter((img) => img.id !== image.id));
  };

  const handleRename = async () => {
    if (!editName.trim() || !folder) return;

    await supabase
      .from("folders")
      .update({ name: editName.trim() })
      .eq("id", folder.id);

    setFolder({ ...folder, name: editName.trim() });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (!folder) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="h-9 w-48"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <Button size="icon" variant="ghost" onClick={handleRename}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{folder.name}</h1>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditName(folder.name);
                setEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}

        <span className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          {images.length}장
        </span>
      </div>

      <UploadDropzone folderId={folderId} onUploaded={fetchData} />

      {images.length === 0 ? (
        <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            아직 이미지가 없습니다. 위에서 이미지를 업로드해보세요!
          </p>
        </div>
      ) : (
        <ImageGrid images={images} onDelete={handleDeleteImage} />
      )}
    </div>
  );
}
