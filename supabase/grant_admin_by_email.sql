-- Replace the email below with the real Supabase Auth admin email.
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'nasrullayevfarrukh@gmail.com'
on conflict (user_id) do update
set email = excluded.email;
