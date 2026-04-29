(() => {
  const Auth = window.RentacarAdminAuth;
  const Data = window.RentacarData;
  if (!Auth || !Data) return;

  const THEME_KEY = "rentacar-admin-theme-v5";
  const LAST_ERROR_KEY = "rentacar-admin-last-error";
  const CONFIG_CACHE_KEY = "rentacar-public-config-v1";
  const CONFIG_ENDPOINTS = [
    "/.netlify/functions/public-config",
    "/api/public-config",
    "/netlify/functions/public-config",
  ];

  const qs = (selector, scope = document) => scope.querySelector(selector);

  const readTheme = () => (localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light");

  const normalizeSupabaseUrl = (value) => {
    let normalized = String(value || "").trim();
    if (!normalized) return "";
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    normalized = normalized.replace(/\/+$/, "");
    normalized = normalized.replace(/\.supabase\.com(?=\/|$)/i, ".supabase.co");
    return normalized;
  };

  const getSupabaseRefFromAnonKey = (value) => {
    try {
      const payload = String(value || "").split(".")[1] || "";
      const normalized = payload
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(Math.ceil(payload.length / 4) * 4, "=");
      const parsed = JSON.parse(atob(normalized));
      return String(parsed?.ref || "").trim();
    } catch {
      return "";
    }
  };

  const normalizeSupabaseUrlWithAnonKey = (value, anonKey) => {
    const normalizedUrl = normalizeSupabaseUrl(value);
    const ref = getSupabaseRefFromAnonKey(anonKey);
    const fallbackUrl = ref ? `https://${ref}.supabase.co` : "";

    if (!fallbackUrl) return normalizedUrl;
    if (!normalizedUrl) return fallbackUrl;

    try {
      const currentHost = new URL(normalizedUrl).host.toLowerCase();
      const fallbackHost = new URL(fallbackUrl).host.toLowerCase();
      return currentHost === fallbackHost ? normalizedUrl : fallbackUrl;
    } catch {
      return fallbackUrl;
    }
  };

  const pickConfigValue = (value, keys) => {
    for (const key of keys) {
      const candidate = String(value?.[key] || "").trim();
      if (candidate) return candidate;
    }
    return "";
  };

  const normalizeConfig = (value) => {
    const supabaseAnonKey = pickConfigValue(value, [
      "supabaseAnonKey",
      "SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]);
    const supabaseUrl = normalizeSupabaseUrlWithAnonKey(
      pickConfigValue(value, [
        "supabaseUrl",
        "SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
      ]),
      supabaseAnonKey
    );
    const carImagesBucket = pickConfigValue(value, [
      "carImagesBucket",
      "SUPABASE_CAR_IMAGES_BUCKET",
      "NEXT_PUBLIC_SUPABASE_CAR_IMAGES_BUCKET",
      "storageBucket",
    ]) || "car-images";

    return {
      supabaseUrl,
      supabaseAnonKey,
      carImagesBucket,
      storageBucket: carImagesBucket,
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: supabaseAnonKey,
      SUPABASE_CAR_IMAGES_BUCKET: carImagesBucket,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
      NEXT_PUBLIC_SUPABASE_CAR_IMAGES_BUCKET: carImagesBucket,
    };
  };

  const writeConfigCache = (value) => {
    const normalized = normalizeConfig(value);
    if (!normalized.supabaseUrl || !normalized.supabaseAnonKey) return null;
    localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(normalized));
    return normalized;
  };

  const fetchFallbackConfig = async () => {
    for (const endpoint of CONFIG_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) continue;
        const payload = normalizeConfig(await response.json());
        if (payload.supabaseUrl && payload.supabaseAnonKey) {
          writeConfigCache(payload);
          return payload;
        }
      } catch {
        // try next endpoint
      }
    }
    return null;
  };

  const ensureConfig = async () => {
    try {
      return await Data.getConfig({ force: true });
    } catch (error) {
      const fallback = await fetchFallbackConfig();
      if (fallback) return fallback;
      throw error;
    }
  };

  const setTheme = (theme) => {
    const current = theme === "dark" ? "dark" : "light";
    document.body.dataset.adminTheme = current;
    localStorage.setItem(THEME_KEY, current);

    const icon = qs("[data-login-theme-icon]");
    const button = qs("[data-login-theme]");
    const meta = qs('meta[name="theme-color"]');

    if (icon) icon.textContent = current === "dark" ? "☀" : "☾";
    if (button) {
      const label = current === "dark" ? "İşıqlı rejim" : "Gecə rejimi";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    }
    if (meta) {
      meta.setAttribute("content", current === "dark" ? "#111827" : "#ff6436");
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const route = Auth.sanitizeRoute(window.location.hash.slice(1));
    const form = qs("[data-login-form]");
    const feedback = qs("[data-login-feedback]");
    const submit = qs("[data-login-submit]");
    const themeButton = qs("[data-login-theme]");

    setTheme(readTheme());

    if (themeButton) {
      themeButton.addEventListener("click", () => {
        setTheme(readTheme() === "dark" ? "light" : "dark");
      });
    }

    if (!form || !feedback || !submit) return;

    try {
      const lastError = sessionStorage.getItem(LAST_ERROR_KEY);
      if (lastError) {
        feedback.textContent = lastError;
        feedback.classList.add("is-error");
        sessionStorage.removeItem(LAST_ERROR_KEY);
      }
    } catch {
      // ignore sessionStorage issues
    }

    try {
      await ensureConfig();
    } catch (error) {
      feedback.textContent = error.message || "Supabase bağlantısı tapılmadı.";
      feedback.classList.add("is-error");
      submit.disabled = true;
      submit.textContent = "Config yoxdur";
      return;
    }

    if (Auth.hasStoredSession()) {
      try {
        await Auth.ensureAuthenticated();
        Auth.redirectToAdmin(route);
        return;
      } catch (error) {
        Auth.logout();
        feedback.textContent = error.message || "Sessiya etibarsızdır. Yenidən daxil olun.";
        feedback.classList.add("is-error");
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      feedback.textContent = "";
      feedback.className = "admin-auth-feedback";
      submit.disabled = true;
      submit.textContent = "Yoxlanılır...";

      const formData = new FormData(form);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        await Auth.signIn(email, password);
        Auth.redirectToAdmin(route);
      } catch (error) {
        feedback.textContent = error.message || "Daxil olma zamanı xəta baş verdi.";
        feedback.classList.add("is-error");
        submit.disabled = false;
        submit.textContent = "Daxil ol";
      }
    });
  });
})();
