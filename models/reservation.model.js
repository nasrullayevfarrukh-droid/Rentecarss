import { db, timestamp } from "../database/db.js";

const mapReservation = (row) => ({
  id: row.id,
  fullName: row.full_name,
  driverLicenseSerial: row.driver_license_serial,
  phone: row.phone,
  carSlug: row.car_slug,
  pickupDate: row.pickup_date,
  pickupTime: row.pickup_time,
  dropoffDate: row.dropoff_date,
  pickupLocation: row.pickup_location,
  note: row.note,
  source: row.source,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createReservationRecord = ({
  fullName,
  driverLicenseSerial,
  phone,
  carSlug,
  pickupDate,
  pickupTime,
  dropoffDate,
  pickupLocation,
  note,
  source = "website",
}) => {
  const now = timestamp();
  const result = db.prepare(`
    INSERT INTO reservations (
      full_name, driver_license_serial, phone, car_slug, pickup_date, pickup_time, dropoff_date, pickup_location, note, source, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
  `).run(
    fullName,
    driverLicenseSerial,
    phone,
    carSlug,
    pickupDate,
    pickupTime,
    dropoffDate ?? "",
    pickupLocation ?? "",
    note ?? "",
    source,
    now,
    now,
  );

  return getReservationById(result.lastInsertRowid);
};

export const listReservations = ({ status = "all", search = "" } = {}) => {
  let query = "SELECT * FROM reservations WHERE 1=1";
  const params = [];

  if (status !== "all") {
    query += " AND status = ?";
    params.push(status);
  }

  if (search) {
    query += " AND (full_name LIKE ? OR phone LIKE ? OR car_slug LIKE ? OR driver_license_serial LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += " ORDER BY datetime(created_at) DESC";
  return db.prepare(query).all(...params).map(mapReservation);
};

export const getReservationById = (id) => {
  const row = db.prepare("SELECT * FROM reservations WHERE id = ?").get(id);
  return row ? mapReservation(row) : null;
};

export const updateReservationRecord = (id, { status, note }) => {
  db.prepare(`
    UPDATE reservations
    SET status = COALESCE(?, status),
        note = COALESCE(?, note),
        updated_at = ?
    WHERE id = ?
  `).run(status ?? null, note ?? null, timestamp(), id);

  return getReservationById(id);
};

export const reservationMetrics = () => {
  const total = db.prepare("SELECT COUNT(*) AS count FROM reservations").get().count;
  const fresh = db.prepare("SELECT COUNT(*) AS count FROM reservations WHERE status = 'new'").get().count;
  const processed = db.prepare("SELECT COUNT(*) AS count FROM reservations WHERE status = 'processed'").get().count;
  return { total, fresh, processed };
};
