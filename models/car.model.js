import { db } from "../database/db.js";

const mapCar = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  category: row.category,
  pricePerDay: Number(row.price_per_day),
  currency: row.currency,
  seats: row.seats,
  fuelType: row.fuel_type,
  transmission: row.transmission,
  bodyType: row.body_type,
  imagePath: row.image_path,
  description: row.description,
});

export const listCars = ({ category } = {}) => {
  let query = "SELECT * FROM cars";
  const params = [];

  if (category && category !== "all") {
    query += " WHERE category LIKE ?";
    params.push(`%${category}%`);
  }

  query += " ORDER BY price_per_day ASC, name ASC";
  return db.prepare(query).all(...params).map(mapCar);
};

export const getCarBySlug = (slug) => {
  const car = db.prepare("SELECT * FROM cars WHERE slug = ?").get(slug);
  return car ? mapCar(car) : null;
};
