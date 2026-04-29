const readEnv = (...keys) => {
  for (const key of keys) {
    const value = String(process.env[key] || "").trim();
    if (value) return value;
  }
  return "";
};

exports.handler = async function handler() {
  const supabaseUrl = readEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL"
  );
  const supabaseAnonKey = readEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY"
  );
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
