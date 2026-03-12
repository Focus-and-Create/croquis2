-- ============================================
-- Croquis 크로키 연습 사이트 - Supabase Schema
-- ============================================
-- Supabase SQL Editor에서 이 스크립트를 실행하세요.

-- 1. 테이블 생성
-- ============================================

-- 폴더 테이블
create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_folders_user on folders(user_id);

-- 이미지 메타데이터 테이블
create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid not null references folders(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_images_folder on images(folder_id);
create index if not exists idx_images_user on images(user_id);

-- 2. RLS (Row Level Security) 활성화
-- ============================================

alter table folders enable row level security;
alter table images enable row level security;

-- 폴더: 본인 데이터만 CRUD
create policy "Users manage own folders" on folders
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 이미지: 본인 데이터만 CRUD
create policy "Users manage own images" on images
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Storage 버킷 & 정책
-- ============================================
-- 먼저 Supabase Dashboard > Storage에서 'reference-images' 버킷을 Private으로 생성하세요.
-- 그 후 아래 정책을 실행하세요.

-- 읽기: 본인 파일만
create policy "Users read own images"
  on storage.objects for select
  using (
    bucket_id = 'reference-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 업로드: 본인 경로에만
create policy "Users upload own images"
  on storage.objects for insert
  with check (
    bucket_id = 'reference-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 삭제: 본인 파일만
create policy "Users delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'reference-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
