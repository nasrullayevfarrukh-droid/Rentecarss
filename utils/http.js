import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  });
  res.end(body);
};

export const sendNotFound = (res) => {
  sendJson(res, 404, { error: "Səhifə tapılmadı." });
};

export const sendMethodNotAllowed = (res) => {
  sendJson(res, 405, { error: "Bu metod dəstəklənmir." });
};

export const parseJsonBody = async (req, limit = 1024 * 1024) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > limit) {
        reject(new Error("Göndərilən məlumat həddən artıq böyükdür."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("JSON məzmunu düzgün deyil."));
      }
    });

    req.on("error", reject);
  });

export const requireAdmin = (req, res, expectedKey) => {
  const headerKey = req.headers["x-admin-key"];
  const authHeader = req.headers.authorization || "";
  const bearerKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const token = String(headerKey || bearerKey || "");

  if (!token || token !== expectedKey) {
    sendJson(res, 401, { error: "İcazə yoxdur." });
    return false;
  }

  return true;
};

export const serveStaticFile = (res, rootDir, pathname) => {
  const decoded = decodeURIComponent(pathname || "/");
  const cleanPath = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const resolvedPath = normalize(join(rootDir, cleanPath));

  if (!resolvedPath.startsWith(normalize(rootDir))) {
    return false;
  }

  let finalPath = resolvedPath;

  if (existsSync(finalPath) && statSync(finalPath).isDirectory()) {
    finalPath = join(finalPath, "index.html");
  }

  if (!existsSync(finalPath)) {
    return false;
  }

  const type = MIME_TYPES[extname(finalPath).toLowerCase()] || "application/octet-stream";
  const file = readFileSync(finalPath);

  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": file.length,
  });
  res.end(file);
  return true;
};

