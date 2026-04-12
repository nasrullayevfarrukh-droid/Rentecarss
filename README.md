# Rentacarss.az Backend Fix

## Audit summary
- Köhnə public sayt maşınları `index.html`, `pages/fleet.html` və `pages/cars/*.html` daxilində hardcoded göstərirdi.
- Köhnə admin panel maşınları real backend-ə yox, `localStorage` içində saxlayırdı.
- Köhnə admin login browser-side saxta auth idi və Supabase/Auth/DB ilə bağlı deyildi.
- Nəticə olaraq admin tərəfdən əlavə olunan maşın public tərəfdə görünmürdü, çünki iki tərəf eyni source of truth istifadə etmirdi.

## Yeni arxitektura
- Cars source of truth: Supabase Postgres `public.cars`
- Homepage editable content source: Supabase Postgres `public.site_content`
- Admin icazə nəzarəti: Supabase Auth + `public.admin_users`
- Şəkillər: Supabase Storage `car-images`
- Public config: Netlify Function `/api/public-config`
- Public rendering: `scripts/supabase-client.js` + `scripts/main.js`
- Admin panel: `/admin` route altında Supabase CRUD paneli

## Əsas dəyişən fayllar
- `F:\VC Codex\Rentacar_ss\scripts\supabase-client.js`
- `F:\VC Codex\Rentacar_ss\scripts\main.js`
- `F:\VC Codex\Rentacar_ss\admin\auth.js`
- `F:\VC Codex\Rentacar_ss\admin\login.html`
- `F:\VC Codex\Rentacar_ss\admin\login-app.js`
- `F:\VC Codex\Rentacar_ss\admin\admin-app.js`
- `F:\VC Codex\Rentacar_ss\admin\index.html`
- `F:\VC Codex\Rentacar_ss\car.html`
- `F:\VC Codex\Rentacar_ss\server.js`
- `F:\VC Codex\Rentacar_ss\config.js`
- `F:\VC Codex\Rentacar_ss\netlify.toml`
- `F:\VC Codex\Rentacar_ss\netlify\functions\public-config.mjs`
- `F:\VC Codex\Rentacar_ss\supabase\schema.sql`
- `F:\VC Codex\Rentacar_ss\.env.example`
- `F:\VC Codex\Rentacar_ss\package.json`
- `F:\VC Codex\Rentacar_ss\styles\main.css`

## Environment variables
Netlify və local env üçün bunları ver:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_CAR_IMAGES_BUCKET=car-images
PORT=3000
ADMIN_API_KEY=rentacar-admin-key
```

Qeyd:
- `SUPABASE_URL` və `SUPABASE_ANON_KEY` public fetch üçün lazımdır.
- `ADMIN_API_KEY` yalnız köhnə reservation/contact local Node endpoint-ləri üçündür, cars CRUD üçün yox.

## Supabase setup
1. Supabase project yarat.
2. `F:\VC Codex\Rentacar_ss\supabase\schema.sql` faylını SQL Editor-da işlət.
3. Authentication bölməsindən admin user yarat.
4. Həmin user-in UUID dəyərini götür.
5. SQL Editor-da aşağıdakı əmri icra et:

```sql
insert into public.admin_users (user_id, email)
values ('SUPABASE_AUTH_USER_UUID', 'admin@example.com');
```

Hazır fayldan istifadə etmək istəsən:
- `F:\VC Codex\Rentacar_ss\supabase\grant_admin_by_email.sql`

6. Storage bucket olaraq `car-images` yaradıldığını və public olduğunu yoxla.
7. `public.site_content` içində `home_hero`, `home_spotlight` və `home_cta` row-ları avtomatik yaranacaq. Bu row-lar admin paneldə Settings bölməsindən idarə olunur.

## Netlify deploy
1. Netlify Site Settings > Environment Variables bölməsinə env-ləri əlavə et.
2. Repo artıq Netlify-yə bağlıdırsa yeni commit push et.
3. `netlify.toml` rewrite-ları ilə `/cars/:slug` route-u `car.html` üzərinə düşəcək.
4. `/api/public-config` funksiyası deploy olduqdan sonra public sayt Supabase config-i runtime-da oxuyacaq.

## Local run
```bash
npm install
npm run dev
```

Local Node server:
- `/api/public-config` endpoint verir
- `/cars/:slug` route-u `car.html` üzərinə rewrite edir
- köhnə `/pages/cars/*.html` URL-lərini `/cars/:slug` ünvanına yönləndirir

## Manual test checklist
1. Admin login ilə `/admin/login.html` aç və daxil ol.
2. Yeni maşın əlavə et, statusu `published` et, cover şəkli yüklə.
3. Ana səhifəni refresh et və maşının kartını gör.
4. `pages/fleet.html` səhifəsində maşını gör və filter/axtarışla tap.
5. Kartı aç və `/cars/<slug>` detail səhifəsində məlumatların düzgün gəldiyini yoxla.
6. Maşını redaktə et və qiymət/təsvir dəyişikliyinin hər yerdə yeniləndiyini təsdiqlə.
7. Statusu `archived` və ya `draft` et, public səhifələrdən itdiyini yoxla.
8. Gallery şəkilləri əlavə et və detail səhifədə göstərildiyini yoxla.
9. Media bölməsində istifadə olunmayan şəkli silə bildiyini yoxla.
10. Settings bölməsindən homepage spotlight section badge, heading, mətn, şəkil URL və CTA-ları dəyiş.
11. Ana səhifəni refresh et və həmin section-un dərhal yeniləndiyini yoxla.
12. Theme toggle ilə dark/light rejimi bütün əsas səhifələrdə test et.

## Qısa qeyd
Bu quruluşda maşın əlavə etmək üçün artıq HTML dəyişmək, GitHub-da data faylı redaktə etmək və ya localStorage istifadə etmək lazım deyil.
