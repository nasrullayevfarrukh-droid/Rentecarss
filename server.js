import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { initDatabase } from "./database/db.js";
import { listCars, getCarBySlug } from "./models/car.model.js";
import {
  createReservationRecord,
  getReservationById,
  listReservations,
  reservationMetrics,
  updateReservationRecord,
} from "./models/reservation.model.js";
import {
  createContactRequestRecord,
  getContactRequestById,
  listContactRequests,
  contactMetrics,
  updateContactRequestRecord,
} from "./models/contact-request.model.js";
import {
  parseJsonBody,
  requireAdmin,
  sendJson,
  sendMethodNotAllowed,
  sendNotFound,
  serveStaticFile,
} from "./utils/http.js";

initDatabase();

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;
const ALLOWED_STATUSES = new Set(["new", "processed", "archived"]);
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const withErrors = (handler) => async (req, res, url, params = {}) => {
  try {
    await handler(req, res, url, params);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Daxili server xətası" });
  }
};

const readSearchParams = (url) => ({
  status: url.searchParams.get("status") || "all",
  search: url.searchParams.get("search") || "",
  category: url.searchParams.get("category") || "all",
});

const normalizeText = (value) => String(value || "").trim();
const normalizeStatus = (value) => normalizeText(value).toLowerCase();
const isValidStatus = (value) => !value || ALLOWED_STATUSES.has(normalizeStatus(value));

const validateReservationBody = (body) => {
  const fullName = normalizeText(body.fullName);
  const driverLicenseSerial = normalizeText(body.driverLicenseSerial);
  const phone = normalizeText(body.phone);
  const carSlug = normalizeText(body.carSlug);
  const pickupDate = normalizeText(body.pickupDate);
  const pickupTime = normalizeText(body.pickupTime);
  const dropoffDate = normalizeText(body.dropoffDate);

  if (!fullName || !driverLicenseSerial || !phone || !carSlug || !pickupDate || !pickupTime) {
    return { error: "Ad, sürücülük vəsiqəsinin seriya nömrəsi, telefon, avtomobil, götürmə tarixi və saatı mütləqdir." };
  }

  if (!getCarBySlug(carSlug)) {
    return { error: "Seçilən avtomobil tapılmadı." };
  }

  if (!TIME_PATTERN.test(pickupTime)) {
    return { error: "Götürmə saatı düzgün formatda olmalıdır." };
  }

  if (dropoffDate && dropoffDate < pickupDate) {
    return { error: "Qaytarma tarixi götürmə tarixindən əvvəl ola bilməz." };
  }

  return {
    fullName,
    driverLicenseSerial,
    phone,
    carSlug,
    pickupDate,
    pickupTime,
    dropoffDate,
    pickupLocation: normalizeText(body.pickupLocation),
    note: normalizeText(body.note),
  };
};

const validateContactBody = (body) => {
  const fullName = normalizeText(body.fullName);
  const phone = normalizeText(body.phone);
  const subject = normalizeText(body.subject);

  if (!fullName || !phone || !subject) {
    return { error: "Ad, telefon və mövzu mütləqdir." };
  }

  return {
    fullName,
    phone,
    subject,
    message: normalizeText(body.message),
  };
};

const readId = (pathname) => Number(pathname.split("/").pop());

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (url.pathname.startsWith("/api/") && req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    });
    res.end();
    return;
  }

  if (url.pathname === "/api/health") {
    if (req.method !== "GET") return sendMethodNotAllowed(res);
    return sendJson(res, 200, { ok: true, service: "rentacar-api", time: new Date().toISOString() });
  }

  if (url.pathname === "/api/public-config" || url.pathname === "/.netlify/functions/public-config") {
    if (req.method !== "GET") return sendMethodNotAllowed(res);
    return sendJson(res, 200, {
      supabaseUrl: config.supabase.url,
      supabaseAnonKey: config.supabase.anonKey,
      carImagesBucket: config.supabase.carImagesBucket,
      storageBucket: config.supabase.carImagesBucket,
    });
  }

  if (url.pathname === "/api/cars") {
    if (req.method !== "GET") return sendMethodNotAllowed(res);
    return sendJson(res, 200, { cars: listCars(readSearchParams(url)) });
  }

  if (url.pathname.startsWith("/api/cars/")) {
    if (req.method !== "GET") return sendMethodNotAllowed(res);
    const slug = url.pathname.split("/").pop();
    const car = getCarBySlug(slug);
    if (!car) return sendNotFound(res);
    return sendJson(res, 200, { car });
  }

  if (url.pathname === "/api/reservations") {
    if (req.method === "POST") {
      return withErrors(async (request, response) => {
        const body = await parseJsonBody(request);
        const payload = validateReservationBody(body);
        if (payload.error) return sendJson(response, 400, { error: payload.error });
        const reservation = createReservationRecord(payload);
        return sendJson(response, 201, { reservation });
      })(req, res, url);
    }

    if (req.method === "GET") {
      if (!requireAdmin(req, res, config.adminApiKey)) return;
      return sendJson(res, 200, { reservations: listReservations(readSearchParams(url)) });
    }

    return sendMethodNotAllowed(res);
  }

  if (url.pathname.startsWith("/api/reservations/")) {
    if (!requireAdmin(req, res, config.adminApiKey)) return;
    const id = readId(url.pathname);
    if (!Number.isInteger(id) || id <= 0) return sendNotFound(res);

    if (req.method === "GET") {
      const reservation = getReservationById(id);
      if (!reservation) return sendNotFound(res);
      return sendJson(res, 200, { reservation });
    }

    if (req.method !== "PATCH") return sendMethodNotAllowed(res);

    return withErrors(async (request, response) => {
      const body = await parseJsonBody(request);
      if (!isValidStatus(body.status)) return sendJson(response, 400, { error: "Status düzgün deyil." });
      const reservation = updateReservationRecord(id, { status: normalizeStatus(body.status), note: normalizeText(body.note) });
      if (!reservation) return sendNotFound(response);
      return sendJson(response, 200, { reservation });
    })(req, res, url);
  }

  if (url.pathname === "/api/contact-requests") {
    if (req.method === "POST") {
      return withErrors(async (request, response) => {
        const body = await parseJsonBody(request);
        const payload = validateContactBody(body);
        if (payload.error) return sendJson(response, 400, { error: payload.error });
        const contactRequest = createContactRequestRecord(payload);
        return sendJson(response, 201, { contactRequest });
      })(req, res, url);
    }

    if (req.method === "GET") {
      if (!requireAdmin(req, res, config.adminApiKey)) return;
      return sendJson(res, 200, { requests: listContactRequests(readSearchParams(url)) });
    }

    return sendMethodNotAllowed(res);
  }

  if (url.pathname.startsWith("/api/contact-requests/")) {
    if (!requireAdmin(req, res, config.adminApiKey)) return;
    const id = readId(url.pathname);
    if (!Number.isInteger(id) || id <= 0) return sendNotFound(res);

    if (req.method === "GET") {
      const contactRequest = getContactRequestById(id);
      if (!contactRequest) return sendNotFound(res);
      return sendJson(res, 200, { contactRequest });
    }

    if (req.method !== "PATCH") return sendMethodNotAllowed(res);

    return withErrors(async (request, response) => {
      const body = await parseJsonBody(request);
      if (!isValidStatus(body.status)) return sendJson(response, 400, { error: "Status düzgün deyil." });
      const contactRequest = updateContactRequestRecord(id, { status: normalizeStatus(body.status), message: normalizeText(body.message) });
      if (!contactRequest) return sendNotFound(response);
      return sendJson(response, 200, { contactRequest });
    })(req, res, url);
  }

  if (url.pathname === "/api/dashboard") {
    if (req.method !== "GET") return sendMethodNotAllowed(res);
    if (!requireAdmin(req, res, config.adminApiKey)) return;
    return sendJson(res, 200, {
      metrics: {
        cars: listCars().length,
        reservations: reservationMetrics(),
        contacts: contactMetrics(),
      },
    });
  }

  const legacyCarMatch = url.pathname.match(/^\/pages\/cars\/([^/]+)\.html$/i);
  if (legacyCarMatch) {
    res.writeHead(301, {
      Location: `/cars/${encodeURIComponent(legacyCarMatch[1])}`,
    });
    res.end();
    return;
  }

  if (/^\/cars\/[^/]+$/i.test(url.pathname)) {
    if (serveStaticFile(res, rootDir, "/car.html")) return;
  }

  if (serveStaticFile(res, rootDir, url.pathname)) return;
  if (serveStaticFile(res, rootDir, join(url.pathname, "index.html"))) return;
  sendNotFound(res);
});

server.listen(config.port, () => {
  console.log(`Rentacar server running on http://localhost:${config.port}`);
});
