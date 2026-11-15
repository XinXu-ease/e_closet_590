-- Run once in Supabase before enabling phone sign-in. Wardrobes stay local.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  avatar_key text not null default 'cat' check (avatar_key in ('cat', 'closet', 'pin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, insert, update, delete on public.profiles to service_role;

create table if not exists public.auth_request_limits (
  key text primary key,
  hits integer not null,
  expires_at timestamptz not null
);
alter table public.auth_request_limits enable row level security;
revoke all on public.auth_request_limits from anon, authenticated;
grant all on public.auth_request_limits to service_role;

create or replace function public.consume_auth_limit(bucket_key text, window_seconds integer, max_requests integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare current_hits integer;
begin
  if window_seconds < 1 or window_seconds > 86400 or max_requests < 1 then
    raise exception 'Invalid rate limit configuration';
  end if;
  delete from public.auth_request_limits where expires_at < now() - interval '1 day';
  insert into public.auth_request_limits(key, hits, expires_at)
  values (bucket_key, 1, now() + make_interval(secs => window_seconds))
  on conflict (key) do update set
    hits = case when auth_request_limits.expires_at <= now() then 1 else auth_request_limits.hits + 1 end,
    expires_at = case when auth_request_limits.expires_at <= now() then now() + make_interval(secs => window_seconds) else auth_request_limits.expires_at end
  returning hits into current_hits;
  return current_hits <= max_requests;
end;
$$;
revoke all on function public.consume_auth_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_auth_limit(text, integer, integer) to service_role;
