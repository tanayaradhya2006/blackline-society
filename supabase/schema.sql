create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null default 'rider' check (role in ('rider','mechanic','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.states (
  slug text primary key,
  name text not null
);

create table if not exists public.brands (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  color text not null default '#ff6a00',
  rsa_phone text,
  rsa_hours text,
  rsa_notes text,
  customer_care text,
  source_url text
);

create table if not exists public.bikes (
  id bigint generated always as identity primary key,
  slug text unique not null,
  brand_id bigint not null references public.brands(id) on delete cascade,
  name text not null,
  category text not null,
  engine_cc numeric,
  power_hp numeric,
  torque_nm numeric,
  mileage_kmpl numeric,
  weight_kg numeric,
  stock_noise_db numeric,
  price_range text,
  tagline text
);

-- Top bikes in each state. rank 1 = most popular.
create table if not exists public.state_bikes (
  state_slug text not null references public.states(slug) on delete cascade,
  bike_id bigint not null references public.bikes(id) on delete cascade,
  rank int not null,
  primary key (state_slug, bike_id)
);

create table if not exists public.issues (
  id bigint generated always as identity primary key,
  bike_id bigint not null references public.bikes(id) on delete cascade,
  title text not null,
  description text,
  severity text not null default 'low' check (severity in ('low','medium','high')),
  fix_tip text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.issue_votes (
  issue_id bigint references public.issues(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (issue_id, user_id)
);

create table if not exists public.mod_parts (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  icon text,
  description text,
  power_pct_min numeric default 0,
  power_pct_max numeric default 0,
  mileage_pct_min numeric default 0,
  mileage_pct_max numeric default 0,
  noise_db_min numeric default 0,
  noise_db_max numeric default 0,
  other_effects text,
  legal_status text not null check (legal_status in ('legal','conditional','illegal')),
  legal_summary text,
  law_refs text,
  source_url text,
  region text not null default 'India',
  last_checked date not null default current_date
);

-- Extra legal or police notes that only apply in one state.
create table if not exists public.mod_state_notes (
  part_id bigint not null references public.mod_parts(id) on delete cascade,
  state_slug text not null references public.states(slug) on delete cascade,
  note text not null,
  source_url text,
  primary key (part_id, state_slug)
);

create table if not exists public.mod_reviews (
  id bigint generated always as identity primary key,
  bike_id bigint not null references public.bikes(id) on delete cascade,
  part_id bigint not null references public.mod_parts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  mileage_before numeric,
  mileage_after numeric,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bike_id bigint references public.bikes(id) on delete set null,
  title text not null check (char_length(title) between 5 and 200),
  body text not null,
  tag text not null default 'Help',
  created_at timestamptz not null default now()
);

create table if not exists public.post_votes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.mechanics (
  id bigint generated always as identity primary key,
  user_id uuid unique references public.profiles(id) on delete cascade,
  shop_name text not null,
  city text not null,
  address text,
  phone text,
  google_maps_url text,
  place_id text,
  google_rating numeric,
  google_found boolean not null default false,
  specialties text[] not null default '{}',
  lat double precision,
  lng double precision,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.states (slug, name) values ('karnataka', 'Karnataka') on conflict (slug) do nothing;
alter table public.mechanics add column if not exists state text not null default 'karnataka' references public.states(slug);

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text := coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1), 'rider');
begin
  insert into public.profiles (id, username)
  values (new.id, base || '_' || substr(replace(new.id::text,'-',''),1,4));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_mechanic_status(mech_id bigint, new_status text)
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can verify mechanics';
  end if;
  update public.mechanics set status = new_status where id = mech_id returning user_id into uid;
  if uid is not null then
    update public.profiles
      set role = case when new_status = 'verified' then 'mechanic' else 'rider' end
      where id = uid and role <> 'admin';
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.bikes enable row level security;
alter table public.issues enable row level security;
alter table public.issue_votes enable row level security;
alter table public.mod_parts enable row level security;
alter table public.mod_reviews enable row level security;
alter table public.posts enable row level security;
alter table public.post_votes enable row level security;
alter table public.comments enable row level security;
alter table public.mechanics enable row level security;
alter table public.states enable row level security;
alter table public.state_bikes enable row level security;
alter table public.mod_state_notes enable row level security;

drop policy if exists "read states" on public.states;
create policy "read states" on public.states for select using (true);
drop policy if exists "admin states" on public.states;
create policy "admin states" on public.states for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read state bikes" on public.state_bikes;
create policy "read state bikes" on public.state_bikes for select using (true);
drop policy if exists "admin state bikes" on public.state_bikes;
create policy "admin state bikes" on public.state_bikes for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read state notes" on public.mod_state_notes;
create policy "read state notes" on public.mod_state_notes for select using (true);
drop policy if exists "admin state notes" on public.mod_state_notes;
create policy "admin state notes" on public.mod_state_notes for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read profiles" on public.profiles;
create policy "read profiles" on public.profiles for select using (true);
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "read brands" on public.brands;
create policy "read brands" on public.brands for select using (true);
drop policy if exists "admin brands" on public.brands;
create policy "admin brands" on public.brands for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read bikes" on public.bikes;
create policy "read bikes" on public.bikes for select using (true);
drop policy if exists "admin bikes" on public.bikes;
create policy "admin bikes" on public.bikes for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read parts" on public.mod_parts;
create policy "read parts" on public.mod_parts for select using (true);
drop policy if exists "admin parts" on public.mod_parts;
create policy "admin parts" on public.mod_parts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read issues" on public.issues;
create policy "read issues" on public.issues for select using (true);
drop policy if exists "add issues" on public.issues;
create policy "add issues" on public.issues for insert with check (auth.uid() = created_by);
drop policy if exists "admin issues" on public.issues;
create policy "admin issues" on public.issues for delete using (public.is_admin());

drop policy if exists "read issue votes" on public.issue_votes;
create policy "read issue votes" on public.issue_votes for select using (true);
drop policy if exists "vote issues" on public.issue_votes;
create policy "vote issues" on public.issue_votes for insert with check (auth.uid() = user_id);
drop policy if exists "unvote issues" on public.issue_votes;
create policy "unvote issues" on public.issue_votes for delete using (auth.uid() = user_id);

drop policy if exists "read reviews" on public.mod_reviews;
create policy "read reviews" on public.mod_reviews for select using (true);
drop policy if exists "add reviews" on public.mod_reviews;
create policy "add reviews" on public.mod_reviews for insert with check (auth.uid() = user_id);
drop policy if exists "delete own reviews" on public.mod_reviews;
create policy "delete own reviews" on public.mod_reviews for delete using (auth.uid() = user_id or public.is_admin());

drop policy if exists "read posts" on public.posts;
create policy "read posts" on public.posts for select using (true);
drop policy if exists "add posts" on public.posts;
create policy "add posts" on public.posts for insert with check (auth.uid() = user_id);
drop policy if exists "delete own posts" on public.posts;
create policy "delete own posts" on public.posts for delete using (auth.uid() = user_id or public.is_admin());

drop policy if exists "read post votes" on public.post_votes;
create policy "read post votes" on public.post_votes for select using (true);
drop policy if exists "vote posts" on public.post_votes;
create policy "vote posts" on public.post_votes for insert with check (auth.uid() = user_id);
drop policy if exists "unvote posts" on public.post_votes;
create policy "unvote posts" on public.post_votes for delete using (auth.uid() = user_id);

drop policy if exists "read comments" on public.comments;
create policy "read comments" on public.comments for select using (true);
drop policy if exists "add comments" on public.comments;
create policy "add comments" on public.comments for insert with check (auth.uid() = user_id);
drop policy if exists "delete own comments" on public.comments;
create policy "delete own comments" on public.comments for delete using (auth.uid() = user_id or public.is_admin());

drop policy if exists "read verified mechanics" on public.mechanics;
create policy "read verified mechanics" on public.mechanics for select using (status = 'verified' or auth.uid() = user_id or public.is_admin());
drop policy if exists "apply as mechanic" on public.mechanics;
create policy "apply as mechanic" on public.mechanics for insert with check (auth.uid() = user_id and status = 'pending');
drop policy if exists "admin mechanics" on public.mechanics;
create policy "admin mechanics" on public.mechanics for update using (public.is_admin()) with check (public.is_admin());
