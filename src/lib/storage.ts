// Local storage layer using IndexedDB (images) + localStorage (folders/metadata)

import type { Folder, ImageRecord } from "./types";

const DB_NAME = "croquis";
const DB_VERSION = 1;
const IMAGE_STORE = "image_blobs";
const FOLDERS_KEY = "croquis_folders";
const IMAGES_KEY = "croquis_images";

// ── IndexedDB helpers ──

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putBlob(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, "readwrite");
    tx.objectStore(IMAGE_STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getBlob(key: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, "readonly");
    const req = tx.objectStore(IMAGE_STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? undefined);
    req.onerror = () => reject(req.error);
  });
}

async function deleteBlob(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGE_STORE, "readwrite");
    tx.objectStore(IMAGE_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── localStorage helpers ──

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Folders ──

export function getFolders(): Folder[] {
  return readJSON<Folder[]>(FOLDERS_KEY, []);
}

export function getFolder(id: string): Folder | undefined {
  return getFolders().find((f) => f.id === id);
}

export function createFolder(name: string): Folder {
  const folders = getFolders();
  const folder: Folder = {
    id: crypto.randomUUID(),
    name,
    created_at: new Date().toISOString(),
  };
  folders.unshift(folder);
  writeJSON(FOLDERS_KEY, folders);
  return folder;
}

export function renameFolder(id: string, name: string): void {
  const folders = getFolders();
  const idx = folders.findIndex((f) => f.id === id);
  if (idx !== -1) {
    folders[idx].name = name;
    writeJSON(FOLDERS_KEY, folders);
  }
}

export async function deleteFolder(id: string): Promise<void> {
  // Delete all images in this folder
  const images = getImagesByFolder(id);
  for (const img of images) {
    await deleteBlob(img.id);
  }
  // Remove image records
  const allImages = getAllImageRecords().filter((img) => img.folder_id !== id);
  writeJSON(IMAGES_KEY, allImages);
  // Remove folder
  const folders = getFolders().filter((f) => f.id !== id);
  writeJSON(FOLDERS_KEY, folders);
}

// ── Image records (metadata in localStorage, blobs in IndexedDB) ──

function getAllImageRecords(): ImageRecord[] {
  return readJSON<ImageRecord[]>(IMAGES_KEY, []);
}

export function getImagesByFolder(folderId: string): ImageRecord[] {
  return getAllImageRecords()
    .filter((img) => img.folder_id === folderId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getImageCountByFolder(folderId: string): number {
  return getAllImageRecords().filter((img) => img.folder_id === folderId).length;
}

export async function saveImage(
  folderId: string,
  file: File
): Promise<ImageRecord> {
  const id = crypto.randomUUID();
  const record: ImageRecord = {
    id,
    folder_id: folderId,
    file_name: file.name,
    created_at: new Date().toISOString(),
  };

  // Store blob in IndexedDB
  await putBlob(id, file);

  // Store metadata in localStorage
  const all = getAllImageRecords();
  all.push(record);
  writeJSON(IMAGES_KEY, all);

  return record;
}

export async function deleteImage(id: string): Promise<void> {
  await deleteBlob(id);
  const all = getAllImageRecords().filter((img) => img.id !== id);
  writeJSON(IMAGES_KEY, all);
}

export async function getImageUrl(id: string): Promise<string> {
  const blob = await getBlob(id);
  if (!blob) return "";
  return URL.createObjectURL(blob);
}

// Get first image URL for a folder (thumbnail)
export async function getFolderThumbnail(
  folderId: string
): Promise<string | undefined> {
  const images = getImagesByFolder(folderId);
  if (images.length === 0) return undefined;
  return getImageUrl(images[0].id);
}
