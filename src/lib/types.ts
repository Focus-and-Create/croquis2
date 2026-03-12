export type Folder = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  image_count?: number;
  thumbnail_url?: string;
};

export type ImageRecord = {
  id: string;
  user_id: string;
  folder_id: string;
  file_name: string;
  storage_path: string;
  created_at: string;
};

export type SessionConfig = {
  folderIds: string[];
  timerSeconds: number;
  totalRounds: number; // -1 means all images
};
