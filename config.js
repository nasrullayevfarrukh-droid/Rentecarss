process.loadEnvFile?.();

export const config = {
  port: Number(process.env.PORT || 3000),
  adminApiKey: process.env.ADMIN_API_KEY || "rentacar-admin-key",
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    carImagesBucket: process.env.SUPABASE_CAR_IMAGES_BUCKET || "car-images",
  },
  brand: {
    name: "Rentacar",
    phone: "+994998891919",
    whatsapp: "994998891919",
    address: "Fətəli Xan Xoyski 132, Nəriman Nərimanov metrosunun yaxınlığı",
  },
};
