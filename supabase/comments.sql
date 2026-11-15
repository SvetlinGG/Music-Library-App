
alter table public.comments
  alter column user_id set default auth.uid();


alter table public.comments
  add column if not exists author text
  default coalesce(auth.jwt() -> 'user_metadata' ->> 'user_name', auth.jwt() ->> 'email');

create index if not exists comments_album_id_idx on public.comments (album_id, created_at desc);

alter table public.comments enable row level security;

drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments"
  on public.comments for select
  using (true);

drop policy if exists "Anyone can add comments" on public.comments;
drop policy if exists "Users can add own comments" on public.comments;
create policy "Users can add own comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);
