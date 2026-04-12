import { db, timestamp } from "../database/db.js";

const mapContact = (row) => ({
  id: row.id,
  fullName: row.full_name,
  phone: row.phone,
  subject: row.subject,
  message: row.message,
  source: row.source,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createContactRequestRecord = ({
  fullName,
  phone,
  subject,
  message,
  source = "website",
}) => {
  const now = timestamp();
  const result = db.prepare(`
    INSERT INTO contact_requests (
      full_name, phone, subject, message, source, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'new', ?, ?)
  `).run(fullName, phone, subject, message ?? "", source, now, now);

  return getContactRequestById(result.lastInsertRowid);
};

export const listContactRequests = ({ status = "all", search = "" } = {}) => {
  let query = "SELECT * FROM contact_requests WHERE 1=1";
  const params = [];

  if (status !== "all") {
    query += " AND status = ?";
    params.push(status);
  }

  if (search) {
    query += " AND (full_name LIKE ? OR phone LIKE ? OR subject LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += " ORDER BY datetime(created_at) DESC";
  return db.prepare(query).all(...params).map(mapContact);
};

export const getContactRequestById = (id) => {
  const row = db.prepare("SELECT * FROM contact_requests WHERE id = ?").get(id);
  return row ? mapContact(row) : null;
};

export const updateContactRequestRecord = (id, { status, message }) => {
  db.prepare(`
    UPDATE contact_requests
    SET status = COALESCE(?, status),
        message = COALESCE(?, message),
        updated_at = ?
    WHERE id = ?
  `).run(status ?? null, message ?? null, timestamp(), id);

  return getContactRequestById(id);
};

export const contactMetrics = () => {
  const total = db.prepare("SELECT COUNT(*) AS count FROM contact_requests").get().count;
  const fresh = db.prepare("SELECT COUNT(*) AS count FROM contact_requests WHERE status = 'new'").get().count;
  const processed = db.prepare("SELECT COUNT(*) AS count FROM contact_requests WHERE status = 'processed'").get().count;
  return { total, fresh, processed };
};
