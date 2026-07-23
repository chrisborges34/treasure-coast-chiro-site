-- =========================================================================
-- Treasure Coast Spine & Disc Center
-- Booking system + CMS content + role-based auth (admin / patient)
-- =========================================================================

-- ---------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------
create type public.app_role as enum ('admin', 'patient');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security-definer function: safe way to check a role without recursive RLS.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------
-- Profiles (basic patient info, 1:1 with auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select using (public.has_role(auth.uid(), 'admin'));

-- New signups: create a profile row + default 'patient' role automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'patient');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  appointment_date date not null,
  appointment_time time not null,
  reason text,
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (appointment_date, appointment_time)
);

alter table public.bookings enable row level security;

create index bookings_date_idx on public.bookings (appointment_date);
create index bookings_patient_idx on public.bookings (patient_id);

-- Public booking form: anyone can create a booking, but only as themselves
-- (or as a guest with no patient_id) and always starting in 'pending'.
create policy "Anyone can create a pending booking for themselves"
  on public.bookings for insert
  with check (
    status = 'pending'
    and (patient_id is null or patient_id = auth.uid())
  );

create policy "Patients can view their own bookings"
  on public.bookings for select
  using (auth.uid() = patient_id);

create policy "Admins can view all bookings"
  on public.bookings for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update bookings"
  on public.bookings for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete bookings"
  on public.bookings for delete
  using (public.has_role(auth.uid(), 'admin'));

-- Privacy-safe availability check: returns only the booked *times* for a
-- given day (no names/emails/phones) so the public booking form can compute
-- open slots without ever exposing other patients' data.
create or replace function public.get_booked_times(_date date)
returns setof time
language sql
stable
security definer
set search_path = public
as $$
  select appointment_time from public.bookings
  where appointment_date = _date and status != 'cancelled'
$$;

grant execute on function public.get_booked_times(date) to anon, authenticated;

-- ---------------------------------------------------------------------
-- CMS: simple editable key/value content blocks used across the site
-- ---------------------------------------------------------------------
create table public.content_blocks (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.content_blocks enable row level security;

create policy "Anyone can read content"
  on public.content_blocks for select using (true);

create policy "Admins can manage content"
  on public.content_blocks for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Seed the current homepage copy so the CMS starts populated.
insert into public.content_blocks (key, value) values
  ('hero_title', 'Advanced care for your spine & discs.'),
  ('hero_subtitle', 'Specializing in non-surgical spinal decompression and comprehensive chiropractic adjustments to restore your mobility and eliminate chronic pain.'),
  ('about_paragraph_1', 'Treasure Coast Spine & Disc Center is dedicated to helping patients across West Palm Beach recover from disc injuries, chronic back and neck pain, and nerve-related symptoms — without surgery or long-term medication.'),
  ('about_paragraph_2', 'Our approach pairs evidence-based chiropractic technique with modern spinal decompression to address the mechanical source of pain. Every patient receives a personal evaluation and a care plan built for measurable, lasting progress.');

-- ---------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create trigger content_blocks_set_updated_at
  before update on public.content_blocks
  for each row execute function public.set_updated_at();
