import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "data");
const dbPath = join(dataDir, "rentacar.sqlite");

mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(dbPath);
export const timestamp = () => new Date().toISOString();

const CAR_SEED = [
  {
    slug: "cerato",
    name: "Kia Cerato",
    category: "econom medium",
    pricePerDay: 59.99,
    currency: "AZN",
    seats: 5,
    fuelType: "Benzin",
    transmission: "Avtomat",
    bodyType: "Sedan",
    imagePath: "./kia-cerato.png",
    description: "Şəhər daxilində hərəkət və gündəlik istifadə üçün rahat sedan seçimidir.",
  },
  {
    slug: "elantra",
    name: "Hyundai Elantra",
    category: "econom medium",
    pricePerDay: 74.99,
    currency: "AZN",
    seats: 5,
    fuelType: "Benzin",
    transmission: "Avtomat",
    bodyType: "Sedan",
    imagePath: "./1771498375305-ChatGPT-Image-Feb-19,-2026,-02_48_45-PM.png",
    description: "Balanslı görünüş və rahat gündəlik istifadə üçün uyğun sedan modelidir.",
  },
  {
    slug: "tucson",
    name: "Hyundai Tucson",
    category: "suv",
    pricePerDay: 79.99,
    currency: "AZN",
    seats: 5,
    fuelType: "Benzin",
    transmission: "Avtomat",
    bodyType: "SUV",
    imagePath: "./images (1).jpg",
    description: "Ailə və uzun yol üçün rahat, geniş salonlu SUV modelidir.",
  },
  {
    slug: "mustang",
    name: "Ford Mustang",
    category: "premium",
    pricePerDay: 159.99,
    currency: "AZN",
    seats: 2,
    fuelType: "Benzin",
    transmission: "Avtomat",
    bodyType: "Kupe",
    imagePath: "./Ford-Mustang_Convertible-2015-Front_Three-Quarter.32a57d78.jpg",
    description: "Xüsusi günlər və seçilən sürüş təcrübəsi üçün premium modeldir.",
  },
  {
    slug: "carnival",
    name: "Kia Carnival",
    category: "minivan",
    pricePerDay: 109.99,
    currency: "AZN",
    seats: 7,
    fuelType: "Dizel",
    transmission: "Avtomat",
    bodyType: "Minivan",
    imagePath: "./491418310_572009719261404_7589279120410787750_n.jpg",
    description: "Ailə və qrup səfərləri üçün geniş və rahat minivan seçimidir.",
  },
];

const ensureColumn = (tableName, columnName, definition) => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (columns.some((column) => column.name === columnName)) return;
  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
};

export const initDatabase = () => {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price_per_day REAL NOT NULL,
      currency TEXT NOT NULL,
      seats INTEGER NOT NULL,
      fuel_type TEXT NOT NULL,
      transmission TEXT NOT NULL,
      body_type TEXT NOT NULL,
      image_path TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      driver_license_serial TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL,
      car_slug TEXT NOT NULL,
      pickup_date TEXT NOT NULL,
      pickup_time TEXT NOT NULL DEFAULT '',
      dropoff_date TEXT NOT NULL DEFAULT '',
      pickup_location TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'website',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(car_slug) REFERENCES cars(slug) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS contact_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'website',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  ensureColumn("reservations", "driver_license_serial", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("reservations", "pickup_time", "TEXT NOT NULL DEFAULT ''");

  const upsertCar = db.prepare(`
    INSERT INTO cars (
      slug, name, category, price_per_day, currency, seats, fuel_type, transmission, body_type, image_path, description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      price_per_day = excluded.price_per_day,
      currency = excluded.currency,
      seats = excluded.seats,
      fuel_type = excluded.fuel_type,
      transmission = excluded.transmission,
      body_type = excluded.body_type,
      image_path = excluded.image_path,
      description = excluded.description,
      updated_at = excluded.updated_at
  `);

  CAR_SEED.forEach((car) => {
    const now = timestamp();
    upsertCar.run(
      car.slug,
      car.name,
      car.category,
      car.pricePerDay,
      car.currency,
      car.seats,
      car.fuelType,
      car.transmission,
      car.bodyType,
      car.imagePath,
      car.description,
      now,
      now,
    );
  });
};
