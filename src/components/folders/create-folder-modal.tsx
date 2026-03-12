"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateFolderModal({ isOpen, onClose, onCreated }: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인이 필요합니다");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("folders")
      .insert({ name: name.trim(), user_id: user.id });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      setName("");
      setLoading(false);
      onCreated();
      onClose();
    }
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
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? <Spinner size={18} /> : "만들기"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
