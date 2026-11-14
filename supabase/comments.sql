-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> Run
-- Creates the "comments" table used by src/api/comments-Supabase.js

create table if not exists public.comments (
  id          bigint generated always as identity primary key,
  album_id    text        not null,
  author      text        not null check (char_length(author) between 1 and 50),
  text        text        not null check (char_length(text) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index if not exists comments_album_id_idx on public.comments (album_id, created_at desc);

-- Row Level Security: everyone can read and add comments, nobody can edit/delete from the app
alter table public.comments enable row level security;

drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments"
  on public.comments for select
  using (true);

drop policy if exists "Anyone can add comments" on public.comments;
create policy "Anyone can add comments"
  on public.comments for insert
  with check (true);
