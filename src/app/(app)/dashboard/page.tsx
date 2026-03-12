"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FolderCard } from "@/components/folders/folder-card";
import { CreateFolderModal } from "@/components/folders/create-folder-modal";
import {
  getFolders,
  getImageCountByFolder,
  getFolderThumbnail,
  deleteFolder,
} from "@/lib/storage";
import type { Folder } from "@/lib/types";
import { FolderPlus, Play } from "lucide-react";

export default function DashboardPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchFolders = useCallback(async () => {
    const raw = getFolders();
    const withCounts = await Promise.all(
      raw.map(async (folder) => {
        const image_count = getImageCountByFolder(folder.id);
        const thumbnail_url = await getFolderThumbnail(folder.id);
        return { ...folder, image_count, thumbnail_url };
      })
    );
    setFolders(withCounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("이 폴더와 모든 이미지를 삭제하시겠습니까?")) return;
    await deleteFolder(folderId);
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">내 폴더</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateModal(true)}>
            <FolderPlus className="h-4 w-4" />
            새 폴더
          </Button>
          {folders.length > 0 && (
            <Link href="/practice/setup">
              <Button>
                <Play className="h-4 w-4" />
                연습 시작
              </Button>
            </Link>
          )}
        </div>
      </div>

      {folders.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center">
          <FolderPlus className="h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-medium text-foreground">아직 폴더가 없습니다</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              폴더를 만들고 레퍼런스 이미지를 업로드해보세요
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <FolderPlus className="h-4 w-4" />
            첫 폴더 만들기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onDelete={handleDeleteFolder}
            />
          ))}
        </div>
      )}

      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchFolders}
      />
    </div>
  );
}
