const readEnv = (key) => {
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

export default async () => {
  const payload = {
    supabaseUrl: readEnv("SUPABASE_URL"),
    supabaseAnonKey: readEnv("SUPABASE_ANON_KEY"),
    storageBucket: readEnv("SUPABASE_CAR_IMAGES_BUCKET") || "car-images",
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
