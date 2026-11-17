-- Existing profiles are already set up; newly created profiles need onboarding.
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles add column if not exists setup_complete boolean not null default true;
alter table public.profiles alter column setup_complete set default false;
update public.profiles set avatar_key = 'cat' where avatar_key <> 'cat';
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', false, 524288, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
