export default async () => {
  const payload = {
    supabaseUrl: Netlify.env.get("SUPABASE_URL") || "",
    supabaseAnonKey: Netlify.env.get("SUPABASE_ANON_KEY") || "",
    storageBucket: Netlify.env.get("SUPABASE_CAR_IMAGES_BUCKET") || "car-images",
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
