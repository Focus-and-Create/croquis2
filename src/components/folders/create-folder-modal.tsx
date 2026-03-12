"use client";

import { useState } from "react";
import { createFolder } from "@/lib/storage";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateFolderModal({ isOpen, onClose, onCreated }: CreateFolderModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createFolder(name.trim());
    setName("");
    onCreated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새 폴더 만들기">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="folderName" className="text-sm font-medium text-foreground">
            폴더 이름
          </label>
          <Input
            id="folderName"
            placeholder="예: 인체 드로잉, 동물, 풍경..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            만들기
          </Button>
        </div>
      </form>
    </Modal>
  );
}
