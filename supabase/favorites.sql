
alter table public.favorites
  add column if not exists year integer,
  add column if not exists genre text;


alter table public.favorites
  alter column user_id set default auth.uid();


create unique index if not exists favorites_user_album_idx
  on public.favorites (user_id, itunes_id);

alter table public.favorites enable row level security;

drop policy if exists "Users can read own favorites" on public.favorites;
create policy "Users can read own favorites"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add own favorites" on public.favorites;
create policy "Users can add own favorites"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);
