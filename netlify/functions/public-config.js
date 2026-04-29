const readEnv = (...keys) => {
  for (const key of keys) {
    const value = String(process.env[key] || "").trim();
    if (value) return value;
  }
  return "";
};

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
    const parsed = JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
    return String((parsed && parsed.ref) || "").trim();
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

exports.handler = async function handler() {
  const supabaseAnonKey = readEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY"
  );
  const supabaseUrl = normalizeSupabaseUrlWithAnonKey(readEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL"
  ), supabaseAnonKey);
  const carImagesBucket = readEnv(
    "NEXT_PUBLIC_SUPABASE_CAR_IMAGES_BUCKET",
    "SUPABASE_CAR_IMAGES_BUCKET"
  ) || "car-images";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      supabaseUrl,
      supabaseAnonKey,
      carImagesBucket,
      storageBucket: carImagesBucket,
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: supabaseAnonKey,
      SUPABASE_CAR_IMAGES_BUCKET: carImagesBucket,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
      NEXT_PUBLIC_SUPABASE_CAR_IMAGES_BUCKET: carImagesBucket
    })
  };
};
