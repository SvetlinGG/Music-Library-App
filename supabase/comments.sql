
alter table public.comments
  alter column user_id set default auth.uid();


alter table public.comments
  add column if not exists author text
  default coalesce(auth.jwt() -> 'user_metadata' ->> 'user_name', auth.jwt() ->> 'email');


update public.comments c
set author = coalesce(u.raw_user_meta_data ->> 'user_name', u.email)
from auth.users u
where u.id = c.user_id
  and c.author is null;

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


drop policy if exists "Users can update own comments" on public.comments;
create policy "Users can update own comments"
  on public.comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on public.comments;
create policy "Users can delete own comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);


create or replace function public.comments_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.comments_set_updated_at();
