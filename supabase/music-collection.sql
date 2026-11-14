-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> Run
-- Makes Supabase itself allow each user to see and change ONLY their own rows
-- in "music-collection" (used by src/api/collection-Supabase.js).

-- user_id is filled from the logged-in user when it is not sent
alter table public."music-collection"
  alter column user_id set default auth.uid();

-- the same album can be in a user's collection only once
create unique index if not exists music_collection_user_album_idx
  on public."music-collection" (user_id, itunes_id);

alter table public."music-collection" enable row level security;

drop policy if exists "Users can read own collection" on public."music-collection";
create policy "Users can read own collection"
  on public."music-collection" for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can add to own collection" on public."music-collection";
create policy "Users can add to own collection"
  on public."music-collection" for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete from own collection" on public."music-collection";
create policy "Users can delete from own collection"
  on public."music-collection" for delete
  to authenticated
  using (auth.uid() = user_id);
