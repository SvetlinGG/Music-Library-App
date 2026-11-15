
alter table public."music-collection"
  alter column itunes_id drop default,
  alter column itunes_id type bigint using null;


alter table public."music-collection"
  alter column user_id set default auth.uid();


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
