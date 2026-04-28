const readSingleEnv = (key) => {
  try {
    if (typeof process !== "undefined" && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {
    // ignore
  }

  try {
    if (typeof Netlify !== "undefined" && Netlify.env && typeof Netlify.env.get === "function") {
      return Netlify.env.get(key) || "";
    }
  } catch {
    // ignore
  }

  return "";
};

const readEnv = (...keys) => {
  for (const key of keys) {
    const value = String(readSingleEnv(key) || "").trim();
    if (value) return value;
  }
  return "";
};

export default async () => {
  const payload = {
    supabaseUrl: readEnv(
      "SUPABASE_URL",
      "PUBLIC_SUPABASE_URL",
      "VITE_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_PROJECT_URL"
    ),
    supabaseAnonKey: readEnv(
      "SUPABASE_ANON_KEY",
      "PUBLIC_SUPABASE_ANON_KEY",
      "VITE_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_PUBLIC_ANON_KEY"
    ),
    storageBucket: readEnv(
      "SUPABASE_CAR_IMAGES_BUCKET",
      "PUBLIC_SUPABASE_CAR_IMAGES_BUCKET",
      "VITE_SUPABASE_CAR_IMAGES_BUCKET",
      "NEXT_PUBLIC_SUPABASE_CAR_IMAGES_BUCKET"
    ) || "car-images",
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

export const config = {
  path: "/api/public-config",
};
