create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  brand text not null,
  model text not null,
  year integer,
  daily_price numeric(10, 2) not null default 0,
  monthly_price numeric(10, 2),
  transmission text not null,
  fuel_type text not null,
  seats integer not null default 4,
  color text,
  city text not null default 'Bakı',
  summary text,
  description text not null,
  features jsonb not null default '[]'::jsonb,
  cover_image_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  stock_count integer not null default 1,
  availability_status text not null default 'available' check (availability_status in ('available', 'rented', 'unavailable')),
  category text not null default 'sedan',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cars_features_array check (jsonb_typeof(features) = 'array'),
  constraint cars_gallery_images_array check (jsonb_typeof(gallery_images) = 'array'),
  constraint cars_stock_count_check check (stock_count >= 0)
);

alter table public.cars
  add column if not exists stock_count integer not null default 1,
  add column if not exists availability_status text not null default 'available';

alter table public.cars
  alter column city set default 'Bakı';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cars_stock_count_check'
      and conrelid = 'public.cars'::regclass
  ) then
    alter table public.cars
      add constraint cars_stock_count_check check (stock_count >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'cars_availability_status_check'
      and conrelid = 'public.cars'::regclass
  ) then
    alter table public.cars
      add constraint cars_availability_status_check
      check (availability_status in ('available', 'rented', 'unavailable'));
  end if;
end
$$;

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_content_value_object check (jsonb_typeof(value) = 'object')
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  driver_license_serial text not null,
  phone text not null,
  car_slug text not null,
  pickup_date date not null,
  pickup_time text not null,
  dropoff_date date,
  pickup_location text,
  note text,
  source text not null default 'website',
  status text not null default 'new' check (status in ('new', 'reviewed', 'spam', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cars_status_featured_sort_idx
  on public.cars (status, featured desc, sort_order asc, updated_at desc);

create index if not exists cars_slug_idx
  on public.cars (slug);

create index if not exists reservations_status_created_idx
  on public.reservations (status, created_at desc);

create index if not exists reservations_car_slug_idx
  on public.reservations (car_slug, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to anon, authenticated;

drop trigger if exists cars_set_updated_at on public.cars;
create trigger cars_set_updated_at
before update on public.cars
for each row
execute function public.set_updated_at();

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
before update on public.site_content
for each row
execute function public.set_updated_at();

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
before update on public.reservations
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.cars enable row level security;
alter table public.site_content enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "Admin users can read own row" on public.admin_users;
create policy "Admin users can read own row"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Published cars are public" on public.cars;
create policy "Published cars are public"
  on public.cars
  for select
  to anon, authenticated
  using (status = 'published' or public.is_admin_user());

drop policy if exists "Admins can insert cars" on public.cars;
create policy "Admins can insert cars"
  on public.cars
  for insert
  to authenticated
  with check (public.is_admin_user());

drop policy if exists "Admins can update cars" on public.cars;
create policy "Admins can update cars"
  on public.cars
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can delete cars" on public.cars;
create policy "Admins can delete cars"
  on public.cars
  for delete
  to authenticated
  using (public.is_admin_user());

drop policy if exists "Site content is public readable" on public.site_content;
create policy "Site content is public readable"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert site content" on public.site_content;
create policy "Admins can insert site content"
  on public.site_content
  for insert
  to authenticated
  with check (public.is_admin_user());

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
  on public.site_content
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can delete site content" on public.site_content;
create policy "Admins can delete site content"
  on public.site_content
  for delete
  to authenticated
  using (public.is_admin_user());

drop policy if exists "Anon can insert reservations" on public.reservations;
create policy "Anon can insert reservations"
  on public.reservations
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and source = 'website'
  );

drop policy if exists "Admins can read reservations" on public.reservations;
create policy "Admins can read reservations"
  on public.reservations
  for select
  to authenticated
  using (public.is_admin_user());

drop policy if exists "Admins can update reservations" on public.reservations;
create policy "Admins can update reservations"
  on public.reservations
  for update
  to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "Admins can delete reservations" on public.reservations;
create policy "Admins can delete reservations"
  on public.reservations
  for delete
  to authenticated
  using (public.is_admin_user());

insert into public.site_content (key, value)
values (
  'home_hero',
  jsonb_build_object(
    'badge', 'Bakı üzrə avtomobil icarəsi',
    'title', '50 AZN-dən başlayan gündəlik və həftəlik avtomobil icarəsi',
    'text', 'Rentacarss.az ilə sedan, SUV, premium və minivan modellərini rahat şəkildə seçə, qiymətləri görə və rezervasiya müraciətini birbaşa göndərə bilərsən. Saytın əsas məqsədi seçimi və əlaqəni sadə saxlamaqdır.',
    'primaryButtonLabel', 'Avtomobillərə bax',
    'primaryButtonLink', './pages/fleet.html',
    'secondaryButtonLabel', 'Əlaqə saxla',
    'secondaryButtonLink', './pages/contact.html',
    'trustItems', jsonb_build_array(
      jsonb_build_object('value', '50 AZN-dən', 'label', 'Gündəlik qiymətlər'),
      jsonb_build_object('value', '5 model', 'label', 'Hazır park seçimi'),
      jsonb_build_object('value', 'WhatsApp', 'label', 'Sürətli əlaqə kanalı')
    )
  )
)
on conflict (key) do nothing;

insert into public.site_content (key, value)
values (
  'home_spotlight',
  jsonb_build_object(
    'badge', 'Sadə iş axını',
    'title', 'Model seçimi, əlaqə və rezervasiya eyni sistemdə saxlanılıb',
    'text', 'Saytın bütün əsas blokları bir məqsədə xidmət edir: modelin tez tapılması, qiymətin aydın görünməsi və müraciətin rahat göndərilməsi.',
    'imageUrl', '/491418310_572009719261404_7589279120410787750_n.jpg',
    'primaryButtonLabel', 'İndi rezervasiya et',
    'primaryButtonLink', './pages/contact.html#rezervasiya',
    'secondaryButtonLabel', 'Haqqımızda',
    'secondaryButtonLink', './pages/about.html',
    'visible', true,
    'cards', jsonb_build_array(
      jsonb_build_object('title', 'Qiymət aydın görünür', 'text', 'Günlük qiymət və əsas detalları kartın üzərində dərhal görürsən.'),
      jsonb_build_object('title', 'Detail səhifə sinxron qalır', 'text', 'Maşın detail, listing və homepage eyni backend mənbəyindən oxunur.'),
      jsonb_build_object('title', 'Müraciət axını qırılmır', 'text', 'Forma işləməsə belə istifadəçi WhatsApp ilə prosesdən çıxmır.')
    )
  )
)
on conflict (key) do nothing;

insert into public.site_content (key, value)
values (
  'home_cta',
  jsonb_build_object(
    'badge', 'Birbaşa əlaqə',
    'title', 'Maşını seçmisənsə, qalanı təxminən 1 dəqiqəyə həll etmək olur',
    'text', 'Sürətli rezervasiya üçün WhatsApp və telefon kanalı həmişə ön planda saxlanılıb.',
    'metaItems', jsonb_build_array(
      '+994 99 889 19 19',
      'WhatsApp ilə operativ cavab',
      'Nərimanovdan rahat təhvil'
    ),
    'primaryButtonLabel', 'WhatsApp ilə yaz',
    'primaryButtonLink', 'https://wa.me/994998891919',
    'secondaryButtonLabel', 'Zəng et',
    'secondaryButtonLink', 'tel:+994998891919'
  )
)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'car-images',
  'car-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read car images" on storage.objects;
create policy "Public can read car images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'car-images');

drop policy if exists "Admins can upload car images" on storage.objects;
create policy "Admins can upload car images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'car-images' and public.is_admin_user());

drop policy if exists "Admins can update car images" on storage.objects;
create policy "Admins can update car images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'car-images' and public.is_admin_user())
  with check (bucket_id = 'car-images' and public.is_admin_user());

drop policy if exists "Admins can delete car images" on storage.objects;
create policy "Admins can delete car images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'car-images' and public.is_admin_user());

-- After creating an auth user, grant admin access like this:
-- insert into public.admin_users (user_id, email)
-- values ('SUPABASE_AUTH_USER_UUID', 'admin@example.com');
