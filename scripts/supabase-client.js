(function () {
  const CONFIG_ENDPOINT = "/.netlify/functions/public-config";
  const SESSION_KEY = "rentacar-admin-session-v1";
  const CONFIG_CACHE_KEY = "rentacar-public-config-v1";
  const DEFAULT_BUCKET = "car-images";
  const PUBLIC_CAR_COLUMN_LIST = [
    "id",
    "slug",
    "title",
    "brand",
    "model",
    "year",
    "daily_price",
    "monthly_price",
    "transmission",
    "fuel_type",
    "seats",
    "color",
    "city",
    "summary",
    "description",
    "features",
    "cover_image_url",
    "gallery_images",
    "featured",
    "status",
    "stock_count",
    "availability_status",
    "rental_days",
    "category",
    "sort_order",
    "created_at",
    "updated_at"
  ];
  const LEGACY_CAR_OPTIONAL_COLUMNS = ["stock_count", "availability_status", "rental_days"];
  const LEGACY_PUBLIC_CAR_COLUMN_LIST = PUBLIC_CAR_COLUMN_LIST.filter(
    (column) => !LEGACY_CAR_OPTIONAL_COLUMNS.includes(column)
  );
  const SAFE_PUBLIC_CAR_COLUMN_LIST = [
    "id",
    "slug",
    "title",
    "brand",
    "model",
    "year",
    "daily_price",
    "monthly_price",
    "transmission",
    "fuel_type",
    "seats",
    "color",
    "city",
    "description",
    "cover_image_url",
    "gallery_images",
    "featured",
    "status",
    "created_at",
    "updated_at"
  ];
  const LEGACY_CAR_STATUS_OVERRIDES_KEY = "car_status_overrides";
  const PUBLIC_CAR_COLUMNS = PUBLIC_CAR_COLUMN_LIST.join(",");
  const LEGACY_PUBLIC_CAR_COLUMNS = LEGACY_PUBLIC_CAR_COLUMN_LIST.join(",");
  const SAFE_PUBLIC_CAR_COLUMNS = SAFE_PUBLIC_CAR_COLUMN_LIST.join(",");
  const SITE_CONTENT_LOCAL_FALLBACK_PREFIX = "rentacar-site-content-fallback-v1:";
  const PUBLIC_CARS_LOCAL_FALLBACK_KEY = "rentacar-public-cars-fallback-v1";
  const SITE_CONTENT_COLUMNS = [
    "key",
    "value",
    "created_at",
    "updated_at"
  ].join(",");
  const RESERVATION_COLUMNS = [
    "id",
    "full_name",
    "driver_license_serial",
    "phone",
    "car_slug",
    "pickup_date",
    "pickup_time",
    "dropoff_date",
    "pickup_location",
    "note",
    "source",
    "status",
    "created_at",
    "updated_at"
  ].join(",");
  const CAR_RESERVATION_COLUMNS = [
    "id",
    "car_id",
    "status",
    "customer_name",
    "customer_phone",
    "start_at",
    "rental_days",
    "end_at",
    "note",
    "created_at",
    "updated_at"
  ].join(",");
  const PUBLIC_CAR_RESERVATION_COLUMNS = [
    "id",
    "car_id",
    "status",
    "start_at",
    "rental_days",
    "end_at",
    "created_at",
    "updated_at"
  ].join(",");
  const DEFAULT_HOME_SPOTLIGHT = {
    badge: "Sadə iş axını",
    title: "Model seçimi, əlaqə və rezervasiya eyni sistemdə saxlanılıb",
    text: "Saytın bütün əsas blokları bir məqsədə xidmət edir: modelin tez tapılması, qiymətin aydın görünməsi və müraciətin rahat göndərilməsi.",
    imageUrl: "/491418310_572009719261404_7589279120410787750_n.jpg",
    primaryButtonLabel: "İndi rezervasiya et",
    primaryButtonLink: "./pages/contact.html#rezervasiya",
    secondaryButtonLabel: "Haqqımızda",
    secondaryButtonLink: "./pages/about.html",
    visible: true,
    cards: [
      {
        title: "Qiymət aydın görünür",
        text: "Günlük qiymət və əsas detalları kartın üzərində dərhal görürsən."
      },
      {
        title: "Detail səhifə sinxron qalır",
        text: "Maşın detail, listing və homepage eyni backend mənbəyindən oxunur."
      },
      {
        title: "Müraciət axını qırılmır",
        text: "Forma işləməsə belə istifadəçi WhatsApp ilə prosesdən çıxmır."
      }
    ],
    translations: {
      ru: {
        badge: "Простой сценарий",
        title: "Выбор модели, контакт и бронирование работают в одной системе",
        text: "Все ключевые блоки сайта служат одной цели: быстро найти модель, сразу увидеть цену и удобно отправить заявку.",
        primaryButtonLabel: "Забронировать сейчас",
        secondaryButtonLabel: "О нас",
        cards: [
          {
            title: "Цена видна сразу",
            text: "Суточная цена и основные детали отображаются прямо на карточке."
          },
          {
            title: "Страница авто остаётся синхронной",
            text: "Карточка, список и detail-страница читают данные из одного backend источника."
          },
          {
            title: "Путь заявки не обрывается",
            text: "Даже если форма не сработает, пользователь не теряется и продолжает через WhatsApp."
          }
        ]
      },
      en: {
        badge: "Simple flow",
        title: "Model choice, contact, and reservation stay in one system",
        text: "Every key block on the site serves one goal: find the right model fast, see the price clearly, and send the request without friction.",
        primaryButtonLabel: "Reserve now",
        secondaryButtonLabel: "About us",
        cards: [
          {
            title: "Pricing is visible instantly",
            text: "Daily price and the main details are shown directly on the card."
          },
          {
            title: "The car page stays in sync",
            text: "Card, listing, and detail page all read from the same backend source."
          },
          {
            title: "The request flow does not break",
            text: "Even if the form fails, the user can continue through WhatsApp."
          }
        ]
      }
    }
  };
  const DEFAULT_HOME_HERO = {
    badge: "Bakı üzrə avtomobil icarəsi",
    title: "50 AZN-dən başlayan gündəlik və həftəlik avtomobil icarəsi",
    text: "Rentacarss.az ilə ekonom, komfort, SUV, premium, sport və minivan modellərini rahat şəkildə seçə, qiymətləri görə və rezervasiya müraciətini birbaşa göndərə bilərsən. Saytın əsas məqsədi seçimi və əlaqəni sadə saxlamaqdır.",
    primaryButtonLabel: "Avtomobillərə bax",
    primaryButtonLink: "./pages/fleet.html",
    secondaryButtonLabel: "Əlaqə saxla",
    secondaryButtonLink: "./pages/contact.html",
    trustItems: [
      { value: "50 AZN-dən", label: "Gündəlik qiymətlər" },
      { value: "5 model", label: "Hazır park seçimi" },
      { value: "WhatsApp", label: "Sürətli əlaqə kanalı" }
    ],
    translations: {
      ru: {
        badge: "Прокат авто по Баку",
        title: "Посуточная и недельная аренда авто от 50 AZN",
        text: "С Rentacarss.az можно быстро выбрать economy, comfort, SUV, premium, sport и minivan модели, увидеть цену и сразу отправить заявку на бронирование. Главная цель сайта — оставить выбор и контакт простыми.",
        primaryButtonLabel: "Посмотреть автомобили",
        secondaryButtonLabel: "Связаться",
        trustItems: [
          { value: "от 50 AZN", label: "Суточные цены" },
          { value: "5 моделей", label: "Доступный парк" },
          { value: "WhatsApp", label: "Быстрый канал связи" }
        ]
      },
      en: {
        badge: "Car rental across Baku",
        title: "Daily and weekly car rental starting from 50 AZN",
        text: "With Rentacarss.az you can quickly choose economy, comfort, SUV, premium, sport, and minivan models, check pricing, and send a reservation request right away. The main goal of the site is to keep selection and contact simple.",
        primaryButtonLabel: "View cars",
        secondaryButtonLabel: "Contact us",
        trustItems: [
          { value: "from 50 AZN", label: "Daily pricing" },
          { value: "5 models", label: "Available fleet" },
          { value: "WhatsApp", label: "Fast contact channel" }
        ]
      }
    }
  };
  const DEFAULT_HOME_CTA = {
    badge: "Birbaşa əlaqə",
    title: "Maşını seçmisənsə, qalanı təxminən 1 dəqiqəyə həll etmək olur",
    text: "Sürətli rezervasiya üçün WhatsApp və telefon kanalı həmişə ön planda saxlanılıb.",
    metaItems: [
      "+994 99 889 19 19",
      "WhatsApp ilə operativ cavab",
      "Nərimanovdan rahat təhvil"
    ],
    primaryButtonLabel: "WhatsApp ilə yaz",
    primaryButtonLink: "https://wa.me/994998891919",
    secondaryButtonLabel: "Zəng et",
    secondaryButtonLink: "tel:+994998891919",
    translations: {
      ru: {
        badge: "Прямой контакт",
        title: "Если автомобиль уже выбран, остальное можно решить примерно за минуту",
        text: "Для быстрого бронирования WhatsApp и телефон всегда остаются на первом плане.",
        metaItems: [
          "+994 99 889 19 19",
          "Оперативный ответ в WhatsApp",
          "Удобная выдача из Нариманова"
        ],
        primaryButtonLabel: "Написать в WhatsApp",
        secondaryButtonLabel: "Позвонить"
      },
      en: {
        badge: "Direct contact",
        title: "If you have already chosen the car, the rest takes about a minute",
        text: "For quick reservations, WhatsApp and phone stay front and center.",
        metaItems: [
          "+994 99 889 19 19",
          "Fast reply on WhatsApp",
          "Convenient pickup from Narimanov"
        ],
        primaryButtonLabel: "Message on WhatsApp",
        secondaryButtonLabel: "Call now"
      }
    }
  };

  let configPromise = null;
  let publishedCarsCache = null;
  let publicCarReservationsCache = null;
  let fallbackCarReservationsCache = null;
  let carsSchemaMode = "full";
  let legacyCarStatusOverridesCache = null;
  let siteContentSchemaMode = "full";
  let carReservationsSchemaMode = "full";
  const CAR_RESERVATIONS_FALLBACK_KEY = "car_reservations_fallback";

  const safeJsonParse = (value, fallback = null) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const parseResponse = async (response) => {
    const text = await response.text();
    const data = text ? safeJsonParse(text, text) : null;

    if (!response.ok) {
      const message = (
        data && typeof data === "object" && (
          data.message
          || data.msg
          || data.error_description
          || data.error
        )
      ) || response.statusText || "Sorgu zamani xeta bas verdi.";
      const error = new Error(message);
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data;
  };

  const normalizeSupabaseUrl = (value) => {
    let normalized = toStringValue(value);
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
      const parsed = JSON.parse(atob(normalized));
      return String(parsed && parsed.ref || "").trim();
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

  const pickConfigValue = (config, keys) => {
    for (const key of keys) {
      const candidate = toStringValue(config && config[key]);
      if (candidate) return candidate;
    }
    return "";
  };

  const normalizePublicConfig = (config) => {
    const supabaseAnonKey = pickConfigValue(config, [
      "supabaseAnonKey",
      "SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]);
    const supabaseUrl = normalizeSupabaseUrlWithAnonKey(
      pickConfigValue(config, [
        "supabaseUrl",
        "SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
      ]),
      supabaseAnonKey
    );
    const carImagesBucket = pickConfigValue(config, [
      "carImagesBucket",
      "SUPABASE_CAR_IMAGES_BUCKET",
      "NEXT_PUBLIC_SUPABASE_CAR_IMAGES_BUCKET",
      "storageBucket",
    ]) || DEFAULT_BUCKET;

    return {
      supabaseUrl,
      supabaseAnonKey,
      carImagesBucket,
      storageBucket: carImagesBucket,
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: supabaseAnonKey,
      SUPABASE_CAR_IMAGES_BUCKET: carImagesBucket,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
      NEXT_PUBLIC_SUPABASE_CAR_IMAGES_BUCKET: carImagesBucket,
    };
  };

  const readCachedConfig = () => {
    try {
      return normalizePublicConfig(safeJsonParse(localStorage.getItem(CONFIG_CACHE_KEY), null));
    } catch {
      return normalizePublicConfig(null);
    }
  };

  const writeCachedConfig = (config) => {
    const normalized = normalizePublicConfig(config);
    if (!normalized.supabaseUrl || !normalized.supabaseAnonKey) return normalized;
    try {
      localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(normalized));
    } catch {
      return normalized;
    }
    return normalized;
  };

  const decodeBase64Url = (value) => {
    const normalized = String(value || "")
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(String(value || "").length / 4) * 4, "=");
    return atob(normalized);
  };

  const getFriendlyAdminErrorMessage = (error) => {
    const message = toStringValue(error && error.message ? error.message : error);
    const lower = message.toLowerCase();

    if (!message) return "Admin girişində xəta baş verdi.";
    if (lower.includes("invalid login credentials")) return "Email və ya şifrə yanlışdır.";
    if (lower.includes("email not confirmed")) return "Bu email hələ təsdiqlənməyib.";
    if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
      return "Supabase bağlantısı alınmadı. İnterneti, `SUPABASE_URL` və `SUPABASE_ANON_KEY` dəyərlərini yoxlayın.";
    }
    if (lower.includes("admin_users")) {
      return "Supabase schema tam qurulmayıb. `supabase/schema.sql` və sonra `supabase/grant_admin_by_email.sql` işlədin.";
    }
    if (lower.includes("admin icazəsi yoxdur")) {
      return "Bu email admin deyil. `supabase/grant_admin_by_email.sql` faylını işlədin.";
    }
    if (lower.includes("jwt") || lower.includes("session") || lower.includes("sessiya")) {
      return "Sessiya etibarsızdır. Yenidən daxil olun.";
    }
    return message;
  };

  const decodeJwtPayload = (token) => {
    try {
      const payload = String(token || "").split(".")[1];
      return payload ? safeJsonParse(decodeBase64Url(payload), null) : null;
    } catch {
      return null;
    }
  };

  const hasAdminRole = (payload) => {
    if (!payload || typeof payload !== "object") return false;
    const directRole = payload.role;
    const appRole = payload.app_metadata && payload.app_metadata.role;
    const userRole = payload.user_metadata && payload.user_metadata.role;
    const appRoles = payload.app_metadata && payload.app_metadata.roles;
    const userRoles = payload.user_metadata && payload.user_metadata.roles;

    return [directRole, appRole, userRole].includes("admin")
      || (Array.isArray(appRoles) && appRoles.includes("admin"))
      || (Array.isArray(userRoles) && userRoles.includes("admin"));
  };

  const toStringValue = (value) => String(value || "").trim();

  const toNumber = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const toInteger = (value, fallback = null) => {
    const numeric = toNumber(value);
    if (numeric === null) return fallback;
    return Math.max(0, Math.trunc(numeric));
  };

  const normalizeAvailabilityStatus = (value, fallback = "available") => {
    const clean = toStringValue(value).toLowerCase();
    const normalizedFallback = (() => {
      const fallbackValue = toStringValue(fallback).toLowerCase();
      if (fallbackValue === "unavailable") return "expired";
      if (["available", "reserved", "rented", "expired"].includes(fallbackValue)) return fallbackValue;
      return "available";
    })();
    if (["available", "reserved", "rented", "expired", "unavailable"].includes(clean)) {
      return clean === "unavailable" ? "expired" : clean;
    }
    return normalizedFallback;
  };

  const normalizeReservationStatus = (value, fallback = "new") => {
    const clean = toStringValue(value).toLowerCase();
    if (["new", "reviewed", "spam", "archived"].includes(clean)) return clean;
    return fallback;
  };

  const normalizeCarReservationStatus = (value, fallback = "reserved") => {
    const clean = toStringValue(value).toLowerCase();
    if (["reserved", "rented", "expired"].includes(clean)) return clean;
    return fallback;
  };

  const toTimestamp = (value) => {
    if (!value) return null;
    const numeric = Date.parse(String(value));
    return Number.isFinite(numeric) ? numeric : null;
  };

  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === "string") {
      const parsed = safeJsonParse(value, null);
      if (Array.isArray(parsed)) return parsed;
      return value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };
  const cloneData = (value) => safeJsonParse(JSON.stringify(value), value);
  const CONTENT_LOCALES = ["ru", "en"];
  const getErrorText = (error) => {
    if (!error) return "";
    const direct = toStringValue(error.message || error);
    if (direct) return direct.toLowerCase();
    const payloadMessage = toStringValue(
      error.payload && typeof error.payload === "object"
        ? error.payload.message || error.payload.error || error.payload.error_description
        : ""
    );
    return payloadMessage.toLowerCase();
  };

  const isMissingSiteContentTableError = (error) => {
    const message = [
      getErrorText(error),
      safeJsonParse(JSON.stringify(error && error.payload ? error.payload : {}), ""),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      message.includes("public.site_content")
      || message.includes("site_content")
      || message.includes("relation \"public.site_content\" does not exist")
      || message.includes("could not find the table 'public.site_content' in the schema cache")
      || message.includes("could not find the table \"public.site_content\" in the schema cache")
    );
  };

  const isMissingCarReservationsSchemaError = (error) => {
    const message = [
      getErrorText(error),
      safeJsonParse(JSON.stringify(error && error.payload ? error.payload : {}), ""),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      message.includes("public.car_reservations")
      || message.includes("car_reservations")
      || message.includes("public_car_reservations")
      || message.includes("relation \"public.car_reservations\" does not exist")
      || message.includes("relation \"public.public_car_reservations\" does not exist")
      || message.includes("could not find the table 'public.car_reservations' in the schema cache")
      || message.includes("could not find the table 'public.public_car_reservations' in the schema cache")
      || message.includes("rezervasyon planlama tablosu henüz kurulmamış")
    );
  };

  const getSiteContentFallbackStorageKey = (key) => `${SITE_CONTENT_LOCAL_FALLBACK_PREFIX}${toStringValue(key)}`;

  const readSiteContentFallback = (key, fallback = null) => {
    try {
      const stored = localStorage.getItem(getSiteContentFallbackStorageKey(key));
      if (!stored) return cloneData(fallback);
      return safeJsonParse(stored, cloneData(fallback));
    } catch {
      return cloneData(fallback);
    }
  };

  const writeSiteContentFallback = (key, value) => {
    const cleanKey = toStringValue(key);
    const snapshot = cloneData(value);
    try {
      localStorage.setItem(getSiteContentFallbackStorageKey(cleanKey), JSON.stringify(snapshot));
    } catch {
      return snapshot;
    }
    return snapshot;
  };

  const readPublishedCarsFallback = () => {
    try {
      const stored = localStorage.getItem(PUBLIC_CARS_LOCAL_FALLBACK_KEY);
      const parsed = safeJsonParse(stored, []);
      return Array.isArray(parsed) ? parsed.map((item) => normalizeCarRecord(item)) : [];
    } catch {
      return [];
    }
  };

  const writePublishedCarsFallback = (cars) => {
    const snapshot = Array.isArray(cars) ? cars.map((item) => normalizeCarRecord(item)) : [];
    try {
      localStorage.setItem(PUBLIC_CARS_LOCAL_FALLBACK_KEY, JSON.stringify(snapshot));
    } catch {
      return snapshot;
    }
    return snapshot;
  };

  const createUuid = () => {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
      }
    } catch {
      // ignore crypto issues
    }
    return `fallback-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  };
  
  const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const encodeStoragePath = (value) => String(value || "")
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");

  const buildPublicAssetUrlInternal = (supabaseUrl, bucket, path) => {
    if (!path) return "";
    return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`;
  };

  const normalizeCarRecord = (record) => ({
    id: record.id,
    slug: toStringValue(record.slug),
    title: toStringValue(record.title || `${record.brand || ""} ${record.model || ""}`),
    brand: toStringValue(record.brand),
    model: toStringValue(record.model),
    year: toNumber(record.year),
    dailyPrice: toNumber(record.daily_price) || 0,
    monthlyPrice: toNumber(record.monthly_price),
    transmission: toStringValue(record.transmission),
    fuelType: toStringValue(record.fuel_type),
    seats: toNumber(record.seats) || 0,
    color: toStringValue(record.color),
    city: toStringValue(record.city),
    summary: toStringValue(record.summary),
    description: toStringValue(record.description),
    features: toArray(record.features).map((item) => toStringValue(item)).filter(Boolean),
    coverImageUrl: toStringValue(record.cover_image_url),
    galleryImages: toArray(record.gallery_images).map((item) => toStringValue(item)).filter(Boolean),
    featured: Boolean(record.featured),
    status: toStringValue(record.status || "draft"),
    stockCount: toInteger(record.stock_count, 1),
    availabilityStatus: normalizeAvailabilityStatus(record.availability_status, "available"),
    rentalDays: toInteger(record.rental_days, null),
    category: toStringValue(record.category || "economy"),
    sortOrder: toNumber(record.sort_order) || 0,
    createdAt: record.created_at || "",
    updatedAt: record.updated_at || "",
  });

  const normalizeReservationRecord = (record) => ({
    id: record.id,
    fullName: toStringValue(record.full_name),
    driverLicenseSerial: toStringValue(record.driver_license_serial),
    phone: toStringValue(record.phone),
    carSlug: toStringValue(record.car_slug),
    pickupDate: toStringValue(record.pickup_date),
    pickupTime: toStringValue(record.pickup_time),
    dropoffDate: toStringValue(record.dropoff_date),
    pickupLocation: toStringValue(record.pickup_location),
    note: toStringValue(record.note),
    source: toStringValue(record.source || "website"),
    status: normalizeReservationStatus(record.status),
    createdAt: record.created_at || "",
    updatedAt: record.updated_at || "",
  });

  const normalizeCarReservationRecord = (record) => ({
    id: record.id,
    carId: toStringValue(record.car_id),
    status: normalizeCarReservationStatus(record.status),
    customerName: toStringValue(record.customer_name),
    customerPhone: toStringValue(record.customer_phone),
    startDateTime: toStringValue(record.start_at),
    rentalDays: toInteger(record.rental_days, 1) || 1,
    endDateTime: toStringValue(record.end_at),
    note: toStringValue(record.note),
    createdAt: record.created_at || "",
    updatedAt: record.updated_at || "",
  });

  const sortCarReservations = (items, direction = "asc") => {
    const factor = direction === "desc" ? -1 : 1;
    return [...toArray(items)].sort((left, right) => {
      const leftTime = toTimestamp(left && left.startDateTime) ?? toTimestamp(left && left.start_at) ?? 0;
      const rightTime = toTimestamp(right && right.startDateTime) ?? toTimestamp(right && right.start_at) ?? 0;
      return (leftTime - rightTime) * factor;
    });
  };

  const normalizeCarReservationsFallbackStore = (value) => {
    const source = value && typeof value === "object" ? value : {};
    const items = Array.isArray(source.items) ? source.items : [];
    return {
      items: sortCarReservations(
        items
          .map((item) => normalizeCarReservationRecord(item))
          .filter((item) => item.id && item.carId && item.startDateTime && item.endDateTime),
        "asc"
      ).map((item) => ({
        id: item.id,
        car_id: item.carId,
        status: item.status,
        customer_name: item.customerName,
        customer_phone: item.customerPhone,
        start_at: item.startDateTime,
        rental_days: item.rentalDays,
        end_at: item.endDateTime,
        note: item.note,
        created_at: item.createdAt || new Date().toISOString(),
        updated_at: item.updatedAt || new Date().toISOString(),
      })),
    };
  };

  const sanitizePublicCarReservationRecord = (item) => ({
    ...item,
    customerName: "",
    customerPhone: "",
    note: "",
  });

  const listFallbackCarReservations = async ({ force = false, admin = false } = {}) => {
    if (!force && fallbackCarReservationsCache) {
      const cached = sortCarReservations(fallbackCarReservationsCache, "asc");
      return admin ? cached : cached.map(sanitizePublicCarReservationRecord);
    }

    const snapshot = await getSiteContent(
      CAR_RESERVATIONS_FALLBACK_KEY,
      { admin, fallback: { items: [] } }
    );
    const normalized = normalizeCarReservationsFallbackStore(snapshot)
      .items
      .map((item) => normalizeCarReservationRecord(item));
    fallbackCarReservationsCache = normalized.slice();
    carReservationsSchemaMode = "fallback";
    const items = sortCarReservations(normalized, "asc");
    return admin ? items : items.map(sanitizePublicCarReservationRecord);
  };

  const saveFallbackCarReservations = async (items, { preserveSchemaMode = false } = {}) => {
    const normalizedStore = normalizeCarReservationsFallbackStore({ items });
    await saveSiteContent(CAR_RESERVATIONS_FALLBACK_KEY, normalizedStore);
    fallbackCarReservationsCache = normalizedStore.items.map((item) => normalizeCarReservationRecord(item));
    publicCarReservationsCache = null;
    if (!preserveSchemaMode) {
      carReservationsSchemaMode = "fallback";
    }
    return sortCarReservations(fallbackCarReservationsCache, "asc");
  };

  const mirrorFullCarReservationsToFallback = async () => {
    if (carReservationsSchemaMode !== "full") {
      return [];
    }

    const rows = await requestCarReservationsRest({
      admin: true,
      allowMissing: true,
      select: CAR_RESERVATION_COLUMNS,
      order: "start_at.desc",
    });

    if (carReservationsSchemaMode !== "full") {
      return [];
    }

    const items = Array.isArray(rows) ? rows.map(normalizeCarReservationRecord) : [];
    await saveFallbackCarReservations(items, { preserveSchemaMode: true });
    return items;
  };

  const getEffectiveCarReservationStatus = (reservation, now = Date.now()) => {
    const endTimestamp = toTimestamp(reservation && reservation.endDateTime);
    if (endTimestamp !== null && endTimestamp <= now) {
      return "expired";
    }
    return normalizeCarReservationStatus(reservation && reservation.status, "reserved");
  };

  const buildCarReservationSummary = (car, reservations = [], now = Date.now()) => {
    const relevant = toArray(reservations)
      .filter((item) => item && (item.carId === (car && car.id) || item.carId === toStringValue(car && car.id)))
      .map((item) => {
        const startTimestamp = toTimestamp(item.startDateTime);
        const endTimestamp = toTimestamp(item.endDateTime);
        return {
          ...item,
          startTimestamp,
          endTimestamp,
          effectiveStatus: getEffectiveCarReservationStatus(item, now),
        };
      })
      .sort((left, right) => {
        const leftTime = left.startTimestamp === null ? Number.MAX_SAFE_INTEGER : left.startTimestamp;
        const rightTime = right.startTimestamp === null ? Number.MAX_SAFE_INTEGER : right.startTimestamp;
        return leftTime - rightTime;
      });

    if (!relevant.length && car && car.reservationStartDateTime && car.reservationEndDateTime) {
      const startTimestamp = toTimestamp(car.reservationStartDateTime);
      const endTimestamp = toTimestamp(car.reservationEndDateTime);
      relevant.push({
        id: `override-${toStringValue(car.id) || "car"}`,
        carId: toStringValue(car.id),
        status: normalizeAvailabilityStatus(car.availabilityStatus, "reserved"),
        customerName: "",
        customerPhone: "",
        startDateTime: toStringValue(car.reservationStartDateTime),
        rentalDays: toInteger(car.rentalDays, 1) || 1,
        endDateTime: toStringValue(car.reservationEndDateTime),
        note: "",
        createdAt: "",
        updatedAt: "",
        startTimestamp,
        endTimestamp,
        effectiveStatus: normalizeAvailabilityStatus(car.availabilityStatus, "reserved"),
      });
    }

    const activeReservation = relevant.find((item) => (
      item.startTimestamp !== null
      && item.endTimestamp !== null
      && item.startTimestamp <= now
      && item.endTimestamp > now
      && ["reserved", "rented"].includes(item.effectiveStatus)
    )) || null;

    const upcomingReservation = relevant.find((item) => (
      item.startTimestamp !== null
      && item.startTimestamp > now
      && ["reserved", "rented"].includes(item.effectiveStatus)
    )) || null;

    const latestExpiredReservation = [...relevant]
      .filter((item) => item.endTimestamp !== null && item.endTimestamp <= now)
      .sort((left, right) => (right.endTimestamp || 0) - (left.endTimestamp || 0))[0] || null;

    let currentStatus = normalizeAvailabilityStatus(car && car.availabilityStatus, "available");
    if (activeReservation) {
      currentStatus = activeReservation.effectiveStatus;
    } else if (upcomingReservation) {
      if (!["reserved", "rented"].includes(currentStatus)) {
        currentStatus = "available";
      }
    } else if (latestExpiredReservation) {
      currentStatus = "expired";
    }

    if (String(car && car.status || "").trim().toLowerCase() === "archived") {
      currentStatus = "expired";
    }

    return {
      currentStatus,
      activeReservation,
      upcomingReservation,
      latestExpiredReservation,
      remainingMs: activeReservation && activeReservation.endTimestamp !== null
        ? activeReservation.endTimestamp - now
        : null,
      relevantReservations: relevant,
    };
  };

  const serializeCarPayload = (input) => {
    const title = toStringValue(input.title || `${input.brand || ""} ${input.model || ""}`);
    const stockCount = toInteger(input.stockCount, 1);
    const availabilityStatus = normalizeAvailabilityStatus(input.availabilityStatus, "available");
    const rentalDays = availabilityStatus === "rented" ? toInteger(input.rentalDays, null) : null;
    return {
      slug: toStringValue(input.slug) || slugify(title),
      title,
      brand: toStringValue(input.brand),
      model: toStringValue(input.model),
      year: toNumber(input.year),
      daily_price: toNumber(input.dailyPrice) || 0,
      monthly_price: toNumber(input.monthlyPrice),
      transmission: toStringValue(input.transmission),
      fuel_type: toStringValue(input.fuelType),
      seats: toNumber(input.seats) || 0,
      color: toStringValue(input.color),
      city: toStringValue(input.city) || "Bakı",
      summary: toStringValue(input.summary),
      description: toStringValue(input.description),
      features: toArray(input.features).map((item) => toStringValue(item)).filter(Boolean),
      cover_image_url: toStringValue(input.coverImageUrl),
      gallery_images: toArray(input.galleryImages).map((item) => toStringValue(item)).filter(Boolean),
      featured: Boolean(input.featured),
      status: toStringValue(input.status) || "draft",
      stock_count: stockCount,
      availability_status: availabilityStatus,
      rental_days: rentalDays,
      category: toStringValue(input.category) || "economy",
      sort_order: toNumber(input.sortOrder) || 0,
    };
  };

  const serializeReservationPayload = (input) => ({
    full_name: toStringValue(input.fullName),
    driver_license_serial: toStringValue(input.driverLicenseSerial),
    phone: toStringValue(input.phone),
    car_slug: toStringValue(input.carSlug),
    pickup_date: toStringValue(input.pickupDate),
    pickup_time: toStringValue(input.pickupTime),
    dropoff_date: toStringValue(input.dropoffDate) || null,
    pickup_location: toStringValue(input.pickupLocation) || null,
    note: toStringValue(input.note) || null,
    source: toStringValue(input.source) || "website",
    status: normalizeReservationStatus(input.status, "new"),
  });

  const serializeCarReservationPayload = (input) => {
    const status = normalizeCarReservationStatus(input.status, "reserved");
    const startDateTime = toStringValue(input.startDateTime || input.startAt);
    const endDateTime = toStringValue(input.endDateTime || input.endAt);
    const rentalDays = toInteger(input.rentalDays, 1) || 1;

    if (!toStringValue(input.carId)) {
      throw new Error("Araç seçilmelidir.");
    }
    if (!toStringValue(input.customerName) || !toStringValue(input.customerPhone)) {
      throw new Error("Müşteri adı ve telefonu zorunludur.");
    }
    if (!startDateTime || !endDateTime) {
      throw new Error("Başlangıç ve bitiş tarihi zorunludur.");
    }
    const startTimestamp = toTimestamp(startDateTime);
    const endTimestamp = toTimestamp(endDateTime);
    if (startTimestamp === null || endTimestamp === null || endTimestamp <= startTimestamp) {
      throw new Error("Bitiş tarihi başlangıçtan sonra olmalıdır.");
    }

    return {
      car_id: toStringValue(input.carId),
      status,
      customer_name: toStringValue(input.customerName),
      customer_phone: toStringValue(input.customerPhone),
      start_at: startDateTime,
      rental_days: rentalDays,
      end_at: endDateTime,
      note: toStringValue(input.note) || null,
    };
  };

  const rangesOverlap = (leftStart, leftEnd, rightStart, rightEnd) => (
    leftStart !== null
    && leftEnd !== null
    && rightStart !== null
    && rightEnd !== null
    && leftStart < rightEnd
    && rightStart < leftEnd
  );

  const isLegacyCarsSchemaError = (error) => {
    const message = [
      getErrorText(error),
      safeJsonParse(JSON.stringify(error && error.payload ? error.payload : {}), ""),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return LEGACY_CAR_OPTIONAL_COLUMNS.some((column) => (
      message.includes(`column cars.${column} does not exist`)
      || message.includes(`could not find the '${column}' column of 'cars' in the schema cache`)
      || message.includes(`could not find the "${column}" column of "cars" in the schema cache`)
      || (message.includes("schema cache") && message.includes("cars") && message.includes(column))
      || message.includes(`cars.${column}`)
      || message.includes(`"${column}"`)
    ));
  };

  const isCarsSelectCompatibilityError = (error) => {
    const message = [
      getErrorText(error),
      safeJsonParse(JSON.stringify(error && error.payload ? error.payload : {}), ""),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (message.includes("cars") && message.includes("schema cache"))
      || message.includes("column cars.")
      || message.includes("could not find the")
    );
  };

  const stripLegacyCarFields = (payload) => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return payload;
    }

    const next = { ...payload };
    LEGACY_CAR_OPTIONAL_COLUMNS.forEach((column) => {
      delete next[column];
    });
    return next;
  };

  const normalizeCarStatusOverrides = (value) => {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return Object.entries(source).reduce((acc, [slug, status]) => {
      const cleanSlug = toStringValue(slug);
      const statusSource = status && typeof status === "object" && !Array.isArray(status)
        ? status
        : { availabilityStatus: status };
      const cleanStatus = normalizeAvailabilityStatus(statusSource.availabilityStatus, "");
      if (cleanSlug && ["reserved", "rented", "expired"].includes(cleanStatus)) {
        acc[cleanSlug] = {
          availabilityStatus: cleanStatus,
          rentalDays: cleanStatus === "rented" ? toInteger(statusSource.rentalDays, null) : null,
          reservationStartDateTime: toStringValue(statusSource.reservationStartDateTime || statusSource.startDateTime),
          reservationEndDateTime: toStringValue(statusSource.reservationEndDateTime || statusSource.endDateTime),
        };
      }
      return acc;
    }, {});
  };

  const getCarStatusOverrides = async ({ force = false } = {}) => {
    if (!force && legacyCarStatusOverridesCache) {
      return { ...legacyCarStatusOverridesCache };
    }

    const value = await getSiteContent(LEGACY_CAR_STATUS_OVERRIDES_KEY, { fallback: {} });
    legacyCarStatusOverridesCache = normalizeCarStatusOverrides(value);
    return { ...legacyCarStatusOverridesCache };
  };

  const saveCarStatusOverrides = async (overrides) => {
    const normalized = normalizeCarStatusOverrides(overrides);
    legacyCarStatusOverridesCache = { ...normalized };
    await saveSiteContent(LEGACY_CAR_STATUS_OVERRIDES_KEY, normalized);
    publishedCarsCache = null;
    return { ...legacyCarStatusOverridesCache };
  };

  const applyLegacyCarStatusOverrides = async (cars, { force = false } = {}) => {
    const items = Array.isArray(cars) ? cars : [];
    if (!items.length) {
      return items;
    }

    let overrides = {};
    try {
      overrides = await getCarStatusOverrides({ force });
    } catch {
      overrides = {};
    }
    return items.map((car) => {
      if (!car || typeof car !== "object") return car;
      const override = overrides[car.slug];
      const overrideStatus = normalizeAvailabilityStatus(override && override.availabilityStatus, "available");
      const reservationStartDateTime = toStringValue(override && override.reservationStartDateTime);
      const reservationEndDateTime = toStringValue(override && override.reservationEndDateTime);

      if (carsSchemaMode !== "legacy") {
        return {
          ...car,
          reservationStartDateTime,
          reservationEndDateTime,
        };
      }

      const rawStatus = toStringValue(car.status).toLowerCase();
      if (rawStatus !== "published") {
        return {
          ...car,
          availabilityStatus: "expired",
          rentalDays: null,
          reservationStartDateTime,
          reservationEndDateTime,
        };
      }

      return {
        ...car,
        availabilityStatus: ["reserved", "rented", "expired"].includes(overrideStatus) ? overrideStatus : "available",
        rentalDays: overrideStatus === "rented" && override ? toInteger(override.rentalDays, null) : null,
        reservationStartDateTime,
        reservationEndDateTime,
      };
    });
  };

  const persistLegacyCarStatus = async (car, desiredAvailability, desiredStatus, desiredRentalDays = null) => {
    if (carsSchemaMode !== "legacy" || !car || !toStringValue(car.slug)) {
      return car;
    }

    const overrides = await getCarStatusOverrides();
    const nextOverrides = { ...overrides };
    const cleanSlug = toStringValue(car.slug);
    const cleanStatus = toStringValue(desiredStatus || car.status).toLowerCase();
    const cleanAvailability = normalizeAvailabilityStatus(desiredAvailability || car.availabilityStatus);
    const cleanRentalDays = cleanAvailability === "rented"
      ? toInteger(desiredRentalDays !== null && desiredRentalDays !== undefined ? desiredRentalDays : car.rentalDays, null)
      : null;

    if (cleanStatus !== "published" || cleanAvailability === "available") {
      delete nextOverrides[cleanSlug];
    } else {
      nextOverrides[cleanSlug] = {
        availabilityStatus: cleanAvailability,
        rentalDays: cleanRentalDays,
      };
    }

    const changed = JSON.stringify(nextOverrides) !== JSON.stringify(overrides);
    if (changed) {
      await saveCarStatusOverrides(nextOverrides);
    }

    const [nextCar] = await applyLegacyCarStatusOverrides([{
      ...car,
      status: cleanStatus || car.status,
      availabilityStatus: cleanAvailability,
      rentalDays: cleanRentalDays,
    }]);
    return nextCar || car;
  };

  const syncCarReservationDisplayOverride = async (carId) => {
    const cleanCarId = toStringValue(carId);
    if (!cleanCarId) return;

    const cars = await listAdminCars();
    const car = cars.find((item) => toStringValue(item.id) === cleanCarId);
    if (!car || !toStringValue(car.slug)) return;

    const reservations = carReservationsSchemaMode === "full"
      ? await requestCarReservationsRest({
          admin: true,
          allowMissing: true,
          select: CAR_RESERVATION_COLUMNS,
          order: "start_at.desc",
          filters: { car_id: `eq.${cleanCarId}` },
        })
      : await listFallbackCarReservations({ force: true, admin: true });

    const normalizedReservations = Array.isArray(reservations)
      ? reservations.map((item) => normalizeCarReservationRecord(item))
      : [];
    const summary = buildCarReservationSummary(car, normalizedReservations, Date.now());
    const displayReservation = summary.activeReservation || summary.upcomingReservation || summary.latestExpiredReservation || null;
    const overrides = await getCarStatusOverrides();
    const nextOverrides = { ...overrides };

    if (!displayReservation) {
      if (nextOverrides[car.slug]) {
        delete nextOverrides[car.slug];
        await saveCarStatusOverrides(nextOverrides);
      }
      return;
    }

    const displayStatus = summary.activeReservation
      ? summary.currentStatus
      : (summary.upcomingReservation ? "reserved" : summary.currentStatus);

    nextOverrides[car.slug] = {
      availabilityStatus: displayStatus,
      rentalDays: displayStatus === "rented" ? toInteger(displayReservation.rentalDays, car.rentalDays) : null,
      reservationStartDateTime: toStringValue(displayReservation.startDateTime),
      reservationEndDateTime: toStringValue(displayReservation.endDateTime),
    };
    await saveCarStatusOverrides(nextOverrides);
  };

  const syncReservationDisplayOverridesFromItems = async (reservations = []) => {
    const cars = await listAdminCars();
    const overrides = await getCarStatusOverrides();
    const nextOverrides = { ...overrides };
    let changed = false;

    cars.forEach((car) => {
      if (!car || !toStringValue(car.slug)) return;
      const summary = buildCarReservationSummary(car, reservations, Date.now());
      const displayReservation = summary.activeReservation || summary.upcomingReservation || summary.latestExpiredReservation || null;

      if (!displayReservation) {
        if (nextOverrides[car.slug] && (nextOverrides[car.slug].reservationStartDateTime || nextOverrides[car.slug].reservationEndDateTime)) {
          delete nextOverrides[car.slug];
          changed = true;
        }
        return;
      }

      const displayStatus = summary.activeReservation
        ? summary.currentStatus
        : (summary.upcomingReservation ? "reserved" : summary.currentStatus);
      const previous = nextOverrides[car.slug] || {};
      const nextValue = {
        availabilityStatus: displayStatus,
        rentalDays: displayStatus === "rented" ? toInteger(displayReservation.rentalDays, car.rentalDays) : null,
        reservationStartDateTime: toStringValue(displayReservation.startDateTime),
        reservationEndDateTime: toStringValue(displayReservation.endDateTime),
      };

      if (JSON.stringify(previous) !== JSON.stringify(nextValue)) {
        nextOverrides[car.slug] = nextValue;
        changed = true;
      }
    });

    if (changed) {
      await saveCarStatusOverrides(nextOverrides);
    }
  };

  const normalizeHomeSpotlightContent = (value) => {
    const source = value && typeof value === "object" ? value : {};
    const fallback = cloneData(DEFAULT_HOME_SPOTLIGHT);
    const rawCards = Array.isArray(source.cards) ? source.cards : fallback.cards;
    const normalizeLocale = (localeValue, localeFallback) => {
      const localeSource = localeValue && typeof localeValue === "object" ? localeValue : {};
      const localeBase = localeFallback && typeof localeFallback === "object" ? localeFallback : {};
      const localeCards = Array.isArray(localeSource.cards) ? localeSource.cards : localeBase.cards;
      return {
        badge: toStringValue(localeSource.badge) || localeBase.badge || "",
        title: toStringValue(localeSource.title) || localeBase.title || "",
        text: toStringValue(localeSource.text) || localeBase.text || "",
        primaryButtonLabel: toStringValue(localeSource.primaryButtonLabel) || localeBase.primaryButtonLabel || "",
        secondaryButtonLabel: toStringValue(localeSource.secondaryButtonLabel) || localeBase.secondaryButtonLabel || "",
        cards: toArray(localeCards)
          .map((item, index) => ({
            title: toStringValue(item && item.title) || localeBase.cards?.[index]?.title || "",
            text: toStringValue(item && item.text) || localeBase.cards?.[index]?.text || "",
          }))
          .filter((item) => item.title || item.text)
          .slice(0, 4),
      };
    };

    return {
      badge: toStringValue(source.badge) || fallback.badge,
      title: toStringValue(source.title) || fallback.title,
      text: toStringValue(source.text) || fallback.text,
      imageUrl: toStringValue(source.imageUrl) || fallback.imageUrl,
      primaryButtonLabel: toStringValue(source.primaryButtonLabel) || fallback.primaryButtonLabel,
      primaryButtonLink: toStringValue(source.primaryButtonLink) || fallback.primaryButtonLink,
      secondaryButtonLabel: toStringValue(source.secondaryButtonLabel) || fallback.secondaryButtonLabel,
      secondaryButtonLink: toStringValue(source.secondaryButtonLink) || fallback.secondaryButtonLink,
      visible: source.visible !== undefined ? Boolean(source.visible) : fallback.visible,
      cards: rawCards
        .map((item, index) => ({
          title: toStringValue(item && item.title) || fallback.cards[index]?.title || `Kart ${index + 1}`,
          text: toStringValue(item && item.text) || fallback.cards[index]?.text || "",
        }))
        .filter((item) => item.title || item.text)
        .slice(0, 4),
      translations: CONTENT_LOCALES.reduce((acc, locale) => {
        acc[locale] = normalizeLocale(source.translations && source.translations[locale], fallback.translations && fallback.translations[locale]);
        return acc;
      }, {}),
    };
  };

  const normalizeHomeHeroContent = (value) => {
    const source = value && typeof value === "object" ? value : {};
    const fallback = cloneData(DEFAULT_HOME_HERO);
    const rawTrustItems = Array.isArray(source.trustItems) ? source.trustItems : fallback.trustItems;
    const normalizeLocale = (localeValue, localeFallback) => {
      const localeSource = localeValue && typeof localeValue === "object" ? localeValue : {};
      const localeBase = localeFallback && typeof localeFallback === "object" ? localeFallback : {};
      const localeTrustItems = Array.isArray(localeSource.trustItems) ? localeSource.trustItems : localeBase.trustItems;
      return {
        badge: toStringValue(localeSource.badge) || localeBase.badge || "",
        title: toStringValue(localeSource.title) || localeBase.title || "",
        text: toStringValue(localeSource.text) || localeBase.text || "",
        primaryButtonLabel: toStringValue(localeSource.primaryButtonLabel) || localeBase.primaryButtonLabel || "",
        secondaryButtonLabel: toStringValue(localeSource.secondaryButtonLabel) || localeBase.secondaryButtonLabel || "",
        trustItems: toArray(localeTrustItems)
          .map((item, index) => ({
            value: toStringValue(item && item.value) || localeBase.trustItems?.[index]?.value || "",
            label: toStringValue(item && item.label) || localeBase.trustItems?.[index]?.label || "",
          }))
          .filter((item) => item.value || item.label)
          .slice(0, 3),
      };
    };

    return {
      badge: toStringValue(source.badge) || fallback.badge,
      title: toStringValue(source.title) || fallback.title,
      text: toStringValue(source.text) || fallback.text,
      primaryButtonLabel: toStringValue(source.primaryButtonLabel) || fallback.primaryButtonLabel,
      primaryButtonLink: toStringValue(source.primaryButtonLink) || fallback.primaryButtonLink,
      secondaryButtonLabel: toStringValue(source.secondaryButtonLabel) || fallback.secondaryButtonLabel,
      secondaryButtonLink: toStringValue(source.secondaryButtonLink) || fallback.secondaryButtonLink,
      trustItems: rawTrustItems
        .map((item, index) => ({
          value: toStringValue(item && item.value) || fallback.trustItems[index]?.value || "",
          label: toStringValue(item && item.label) || fallback.trustItems[index]?.label || "",
        }))
        .filter((item) => item.value || item.label)
        .slice(0, 3),
      translations: CONTENT_LOCALES.reduce((acc, locale) => {
        acc[locale] = normalizeLocale(source.translations && source.translations[locale], fallback.translations && fallback.translations[locale]);
        return acc;
      }, {}),
    };
  };

  const normalizeHomeCtaContent = (value) => {
    const source = value && typeof value === "object" ? value : {};
    const fallback = cloneData(DEFAULT_HOME_CTA);
    const rawMetaItems = Array.isArray(source.metaItems) ? source.metaItems : fallback.metaItems;
    const normalizeLocale = (localeValue, localeFallback) => {
      const localeSource = localeValue && typeof localeValue === "object" ? localeValue : {};
      const localeBase = localeFallback && typeof localeFallback === "object" ? localeFallback : {};
      const localeMeta = Array.isArray(localeSource.metaItems) ? localeSource.metaItems : localeBase.metaItems;
      return {
        badge: toStringValue(localeSource.badge) || localeBase.badge || "",
        title: toStringValue(localeSource.title) || localeBase.title || "",
        text: toStringValue(localeSource.text) || localeBase.text || "",
        metaItems: toArray(localeMeta)
          .map((item, index) => toStringValue(item) || localeBase.metaItems?.[index] || "")
          .filter(Boolean)
          .slice(0, 4),
        primaryButtonLabel: toStringValue(localeSource.primaryButtonLabel) || localeBase.primaryButtonLabel || "",
        secondaryButtonLabel: toStringValue(localeSource.secondaryButtonLabel) || localeBase.secondaryButtonLabel || "",
      };
    };

    return {
      badge: toStringValue(source.badge) || fallback.badge,
      title: toStringValue(source.title) || fallback.title,
      text: toStringValue(source.text) || fallback.text,
      metaItems: rawMetaItems
        .map((item, index) => toStringValue(item) || fallback.metaItems[index] || "")
        .filter(Boolean)
        .slice(0, 4),
      primaryButtonLabel: toStringValue(source.primaryButtonLabel) || fallback.primaryButtonLabel,
      primaryButtonLink: toStringValue(source.primaryButtonLink) || fallback.primaryButtonLink,
      secondaryButtonLabel: toStringValue(source.secondaryButtonLabel) || fallback.secondaryButtonLabel,
      secondaryButtonLink: toStringValue(source.secondaryButtonLink) || fallback.secondaryButtonLink,
      translations: CONTENT_LOCALES.reduce((acc, locale) => {
        acc[locale] = normalizeLocale(source.translations && source.translations[locale], fallback.translations && fallback.translations[locale]);
        return acc;
      }, {}),
    };
  };

  const getConfig = async ({ force = false } = {}) => {
    if (force) configPromise = null;
    if (!configPromise) {
      configPromise = (async () => {
        let config = normalizePublicConfig(null);

        try {
          const remoteConfig = await fetch(CONFIG_ENDPOINT, { cache: "no-store" }).then(parseResponse);
          config = writeCachedConfig(remoteConfig);
        } catch {
          config = readCachedConfig();
        }

        if (!config.supabaseUrl || !config.supabaseAnonKey) {
          throw new Error("Supabase config tapılmadı. Netlify env və ya local .env faylını yoxlayın.");
        }

        return config;
      })();
    }

    return configPromise;
  };

  const normalizeSessionShape = (session) => {
    const source = session && typeof session === "object" ? session : {};
    const payload = source.access_token ? decodeJwtPayload(source.access_token) : null;
    const user = source.user && typeof source.user === "object"
      ? source.user
      : (payload && payload.sub
        ? {
            id: payload.sub,
            email: payload.email || "",
            app_metadata: payload.app_metadata || {},
            user_metadata: payload.user_metadata || {},
            role: payload.role || "",
          }
        : null);

    return {
      ...source,
      user,
      expires_at: source.expires_at || (
        source.expires_in
          ? Math.floor(Date.now() / 1000) + Number(source.expires_in)
          : null
      ),
    };
  };

  const getStoredSession = () => {
    try {
      return safeJsonParse(localStorage.getItem(SESSION_KEY), null);
    } catch {
      return null;
    }
  };

  const setStoredSession = (session) => {
    if (!session) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    const normalized = normalizeSessionShape(session);

    localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
    return normalized;
  };

  const clearStoredSession = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  const isAdminSession = (session) => {
    const normalized = normalizeSessionShape(session);
    return Boolean(normalized && normalized.is_admin) || hasAdminRole(decodeJwtPayload(normalized && normalized.access_token));
  };

  const verifyAdminAccess = async (session) => {
    const normalizedSession = normalizeSessionShape(session);
    if (!normalizedSession || !normalizedSession.access_token || !normalizedSession.user || !normalizedSession.user.id) {
      throw new Error("Admin sessiyasi etibarsizdir.");
    }

    if (hasAdminRole(decodeJwtPayload(normalizedSession.access_token))) {
      return true;
    }

    const config = await getConfig();
    const url = new URL(`${config.supabaseUrl}/rest/v1/admin_users`);
    url.searchParams.set("select", "user_id");
    url.searchParams.set("user_id", `eq.${normalizedSession.user.id}`);
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: config.supabaseAnonKey,
        Accept: "application/json",
        Authorization: `Bearer ${normalizedSession.access_token}`,
        "Cache-Control": "no-store",
      },
      cache: "no-store",
    });

    const rows = await parseResponse(response);
    if (!Array.isArray(rows) || !rows[0]) {
      throw new Error("Bu istifadəçidə admin icazəsi yoxdur. Supabase `public.admin_users` cədvəlinə bu auth user əlavə edilməlidir.");
    }

    return true;
  };

  const sessionNeedsRefresh = (session) => {
    if (!session || !session.access_token) return true;
    if (!session.expires_at) return false;
    return (Number(session.expires_at) - 60) <= Math.floor(Date.now() / 1000);
  };

  const signInAdmin = async ({ email, password }) => {
    try {
      const config = await getConfig();
      const response = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: config.supabaseAnonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: toStringValue(email),
          password: String(password || ""),
        }),
      });

      const session = normalizeSessionShape(await parseResponse(response));
      await verifyAdminAccess(session);
      return setStoredSession({
        ...session,
        is_admin: true,
      });
    } catch (error) {
      clearStoredSession();
      throw new Error(getFriendlyAdminErrorMessage(error));
    }
  };

  const refreshAdminSession = async () => {
    const currentSession = getStoredSession();
    if (!currentSession || !currentSession.refresh_token) {
      clearStoredSession();
      throw new Error("Admin sessiyasi bitib. Yeniden daxil olun.");
    }

    const config = await getConfig();
    const response = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        apikey: config.supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: currentSession.refresh_token,
      }),
    });

    const refreshedSession = normalizeSessionShape(await parseResponse(response));
    const mergedSession = normalizeSessionShape({
      ...currentSession,
      ...refreshedSession,
    });

    try {
      await verifyAdminAccess(mergedSession);
    } catch (error) {
      clearStoredSession();
      throw new Error(getFriendlyAdminErrorMessage(error));
    }

    return setStoredSession({
      ...mergedSession,
      is_admin: true,
    });
  };

  const ensureAdminSession = async () => {
    let session = normalizeSessionShape(getStoredSession());
    if (!session) {
      throw new Error("Admin sessiyasi tapilmadi.");
    }

    if (!isAdminSession(session)) {
      try {
        await verifyAdminAccess(session);
        session = setStoredSession({
          ...session,
          is_admin: true,
        });
      } catch (error) {
        clearStoredSession();
        throw new Error(getFriendlyAdminErrorMessage(error));
      }
    }

    if (sessionNeedsRefresh(session)) {
      session = await refreshAdminSession();
    }

    return session;
  };

  const requestRest = async (table, {
    method = "GET",
    filters = {},
    select = "*",
    order = "",
    limit = null,
    body,
    admin = false,
    prefer = "",
    headers = {},
    allowEmpty = false,
  } = {}) => {
    const config = await getConfig();
    const url = new URL(`${config.supabaseUrl}/rest/v1/${table}`);

    if (select) url.searchParams.set("select", select);
    if (order) url.searchParams.set("order", order);
    if (limit !== null && limit !== undefined) url.searchParams.set("limit", String(limit));

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });

    let accessToken = "";
    if (admin) {
      accessToken = (await ensureAdminSession()).access_token;
    }

    const requestHeaders = {
      apikey: config.supabaseAnonKey,
      Accept: "application/json",
      ...headers,
    };

    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }

    let requestBody;
    if (body !== undefined) {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }

    if (prefer) requestHeaders.Prefer = prefer;

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      cache: method === "GET" ? "no-store" : "default",
    });

    if (allowEmpty && response.status === 404) return null;
    return parseResponse(response);
  };

  const requestCarsRest = async (options = {}) => {
    const primaryOptions = { ...options };

    try {
      const rows = await requestRest("cars", primaryOptions);
      carsSchemaMode = "full";
      return rows;
    } catch (error) {
      if (!isLegacyCarsSchemaError(error) && !(primaryOptions.select === PUBLIC_CAR_COLUMNS && isCarsSelectCompatibilityError(error))) {
        throw error;
      }

      carsSchemaMode = "legacy";
      const fallbackOptions = { ...primaryOptions };

      if (fallbackOptions.select === PUBLIC_CAR_COLUMNS) {
        fallbackOptions.select = LEGACY_PUBLIC_CAR_COLUMNS;
      }

      try {
        if (fallbackOptions.body && typeof fallbackOptions.body === "object" && !Array.isArray(fallbackOptions.body)) {
          fallbackOptions.body = stripLegacyCarFields(fallbackOptions.body);
        }

        return await requestRest("cars", fallbackOptions);
      } catch (fallbackError) {
        if (primaryOptions.select === PUBLIC_CAR_COLUMNS && isCarsSelectCompatibilityError(fallbackError)) {
          return requestRest("cars", {
            ...fallbackOptions,
            select: SAFE_PUBLIC_CAR_COLUMNS,
          });
        }
        throw fallbackError;
      }
    }
  };

  const requestCarReservationsRest = async ({ publicView = false, allowMissing = false, ...options } = {}) => {
    const table = publicView ? "public_car_reservations" : "car_reservations";

    try {
      const rows = await requestRest(table, options);
      carReservationsSchemaMode = "full";
      return rows;
    } catch (error) {
      if (!isMissingCarReservationsSchemaError(error)) {
        throw error;
      }
      carReservationsSchemaMode = "missing";
      fallbackCarReservationsCache = null;
      if (allowMissing) {
        return [];
      }
      throw error;
    }
  };

  const listPublishedCars = async ({ force = false, featuredOnly = false, limit = null } = {}) => {
    if (publishedCarsCache && !force && !featuredOnly && limit === null) {
      return publishedCarsCache.slice();
    }

    try {
      const rows = await requestCarsRest({
        filters: {
          status: "eq.published",
          ...(featuredOnly ? { featured: "eq.true" } : {}),
        },
        select: PUBLIC_CAR_COLUMNS,
        order: "featured.desc,sort_order.asc,updated_at.desc,title.asc",
        limit,
      });

      const cars = await applyLegacyCarStatusOverrides(
        Array.isArray(rows) ? rows.map(normalizeCarRecord) : [],
        { force }
      );
      if (!featuredOnly && limit === null) {
        publishedCarsCache = cars.slice();
        writePublishedCarsFallback(cars);
      }
      return cars;
    } catch (error) {
      if (!featuredOnly && limit === null) {
        const fallbackCars = readPublishedCarsFallback();
        if (fallbackCars.length) {
          publishedCarsCache = fallbackCars.slice();
          return fallbackCars;
        }
      }
      throw error;
    }
  };

  const getPublishedCarBySlug = async (slug) => {
    const cleanSlug = toStringValue(slug);
    if (!cleanSlug) return null;

    if (publishedCarsCache) {
      const cached = publishedCarsCache.find((car) => car.slug === cleanSlug);
      if (cached) return cached;
    }

    try {
      const rows = await requestCarsRest({
        filters: {
          slug: `eq.${cleanSlug}`,
          status: "eq.published",
        },
        select: PUBLIC_CAR_COLUMNS,
        limit: 1,
        allowEmpty: true,
      });

      if (!Array.isArray(rows) || !rows[0]) return null;
      const [car] = await applyLegacyCarStatusOverrides([normalizeCarRecord(rows[0])], { force: true });
      return car || null;
    } catch (error) {
      const fallbackCars = readPublishedCarsFallback();
      const fallbackCar = fallbackCars.find((car) => car.slug === cleanSlug);
      if (fallbackCar) return fallbackCar;
      throw error;
    }
  };

  const listAdminCars = async () => {
    const rows = await requestCarsRest({
      admin: true,
      select: PUBLIC_CAR_COLUMNS,
      order: "featured.desc,sort_order.asc,updated_at.desc,title.asc",
    });

    return applyLegacyCarStatusOverrides(Array.isArray(rows) ? rows.map(normalizeCarRecord) : [], { force: true });
  };

  const createCar = async (input) => {
    const serialized = serializeCarPayload(input);
    const rows = await requestCarsRest({
      admin: true,
      method: "POST",
      body: serialized,
      prefer: "return=representation",
    });

    publishedCarsCache = null;
    const savedCar = Array.isArray(rows) && rows[0] ? normalizeCarRecord(rows[0]) : null;
    const fallbackCar = savedCar || (carsSchemaMode === "legacy"
      ? {
          slug: serialized.slug,
          status: serialized.status,
          availabilityStatus: serialized.availability_status,
          rentalDays: serialized.rental_days,
        }
      : null);
    return persistLegacyCarStatus(
      fallbackCar,
      serialized.availability_status,
      serialized.status,
      serialized.rental_days
    );
  };

  const updateCar = async (id, input) => {
    const serialized = serializeCarPayload(input);
    const rows = await requestCarsRest({
      admin: true,
      method: "PATCH",
      filters: { id: `eq.${toStringValue(id)}` },
      body: serialized,
      prefer: "return=representation",
    });

    publishedCarsCache = null;
    const savedCar = Array.isArray(rows) && rows[0] ? normalizeCarRecord(rows[0]) : null;
    const fallbackCar = savedCar || (carsSchemaMode === "legacy"
      ? {
          slug: serialized.slug,
          status: serialized.status,
          availabilityStatus: serialized.availability_status,
          rentalDays: serialized.rental_days,
        }
      : null);
    return persistLegacyCarStatus(
      fallbackCar,
      serialized.availability_status,
      serialized.status,
      serialized.rental_days
    );
  };

  const patchCar = async (id, partial) => {
    const payload = {};
    const normalized = partial && typeof partial === "object" ? partial : {};
    const serialized = serializeCarPayload(normalized);

    Object.keys(normalized).forEach((key) => {
      if (key === "dailyPrice") payload.daily_price = serialized.daily_price;
      else if (key === "monthlyPrice") payload.monthly_price = serialized.monthly_price;
      else if (key === "fuelType") payload.fuel_type = serialized.fuel_type;
      else if (key === "coverImageUrl") payload.cover_image_url = serialized.cover_image_url;
      else if (key === "galleryImages") payload.gallery_images = serialized.gallery_images;
      else if (key === "sortOrder") payload.sort_order = serialized.sort_order;
      else if (key === "features") payload.features = serialized.features;
      else if (key === "featured") payload.featured = serialized.featured;
      else if (key === "status") payload.status = serialized.status;
      else if (key === "stockCount") payload.stock_count = serialized.stock_count;
      else if (key === "availabilityStatus") payload.availability_status = serialized.availability_status;
      else if (key === "rentalDays") payload.rental_days = serialized.rental_days;
      else if (key === "category") payload.category = serialized.category;
      else if (key === "city") payload.city = serialized.city;
      else if (key === "color") payload.color = serialized.color;
      else if (key === "transmission") payload.transmission = serialized.transmission;
      else if (key === "seats") payload.seats = serialized.seats;
      else if (key === "brand") payload.brand = serialized.brand;
      else if (key === "model") payload.model = serialized.model;
      else if (key === "title") payload.title = serialized.title;
      else if (key === "slug") payload.slug = serialized.slug;
      else if (key === "description") payload.description = serialized.description;
      else if (key === "summary") payload.summary = serialized.summary;
      else if (key === "year") payload.year = serialized.year;
    });

    const rows = await requestCarsRest({
      admin: true,
      method: "PATCH",
      filters: { id: `eq.${toStringValue(id)}` },
      body: payload,
      prefer: "return=representation",
    });

    publishedCarsCache = null;
    const savedCar = Array.isArray(rows) && rows[0] ? normalizeCarRecord(rows[0]) : null;
    const fallbackCar = savedCar || (carsSchemaMode === "legacy"
      ? {
          slug: serialized.slug,
          status: payload.status || serialized.status,
          availabilityStatus: payload.availability_status || serialized.availability_status,
          rentalDays: "rentalDays" in normalized ? serialized.rental_days : null,
        }
      : null);
    return persistLegacyCarStatus(
      fallbackCar,
      "availabilityStatus" in normalized ? serialized.availability_status : (savedCar ? savedCar.availabilityStatus : "available"),
      "status" in normalized ? serialized.status : (savedCar ? savedCar.status : "published"),
      "rentalDays" in normalized ? serialized.rental_days : (savedCar ? savedCar.rentalDays : null)
    );
  };

  const deleteCar = async (id, slug = "") => {
    await requestCarsRest({
      admin: true,
      method: "DELETE",
      filters: { id: `eq.${toStringValue(id)}` },
      prefer: "return=minimal",
    });
    publishedCarsCache = null;

    if (carsSchemaMode === "legacy" && toStringValue(slug)) {
      const overrides = await getCarStatusOverrides();
      if (overrides[toStringValue(slug)]) {
        const nextOverrides = { ...overrides };
        delete nextOverrides[toStringValue(slug)];
        await saveCarStatusOverrides(nextOverrides);
      }
    }
  };

  const listPublicCarReservations = async ({ force = false } = {}) => {
    if (publicCarReservationsCache && !force) {
      return publicCarReservationsCache.slice();
    }

    const rows = await requestCarReservationsRest({
      publicView: true,
      allowMissing: true,
      select: PUBLIC_CAR_RESERVATION_COLUMNS,
      order: "start_at.asc",
    });

    if (carReservationsSchemaMode === "missing") {
      const items = await listFallbackCarReservations({ force, admin: false });
      publicCarReservationsCache = items.slice();
      return items;
    }

    const items = Array.isArray(rows) ? rows.map(normalizeCarReservationRecord).map(sanitizePublicCarReservationRecord) : [];
    publicCarReservationsCache = items.slice();
    fallbackCarReservationsCache = null;
    return items;
  };

  const markExpiredCarReservations = async (items = null) => {
    if (carReservationsSchemaMode === "fallback" || carReservationsSchemaMode === "missing") {
      const source = await listFallbackCarReservations({ force: true, admin: true });
      const staleItems = source.filter((item) => (
        normalizeCarReservationStatus(item.status, "reserved") !== "expired"
        && toTimestamp(item.endDateTime) !== null
        && toTimestamp(item.endDateTime) <= Date.now()
      ));

      if (!staleItems.length) {
        return 0;
      }

      const staleIds = new Set(staleItems.map((item) => item.id));
      const nowIso = new Date().toISOString();
      await saveFallbackCarReservations(source.map((item) => (
        staleIds.has(item.id)
          ? { ...item, status: "expired", updatedAt: nowIso }
          : item
      )));
      return staleItems.length;
    }

    const source = Array.isArray(items) ? items : await listAdminCarReservations({ syncExpired: false });
    const staleItems = source.filter((item) => (
      normalizeCarReservationStatus(item.status, "reserved") !== "expired"
      && toTimestamp(item.endDateTime) !== null
      && toTimestamp(item.endDateTime) <= Date.now()
    ));

    if (!staleItems.length) {
      return 0;
    }

    await Promise.all(staleItems.map((item) => requestCarReservationsRest({
      admin: true,
      method: "PATCH",
      filters: { id: `eq.${toStringValue(item.id)}` },
      body: { status: "expired" },
      prefer: "return=minimal",
    }).catch(() => null)));

    publicCarReservationsCache = null;
    return staleItems.length;
  };

  const listAdminCarReservations = async ({ carId = "", syncExpired = true } = {}) => {
    const rows = await requestCarReservationsRest({
      admin: true,
      allowMissing: true,
      select: CAR_RESERVATION_COLUMNS,
      order: "start_at.desc",
      filters: carId ? { car_id: `eq.${toStringValue(carId)}` } : {},
    });

    if (carReservationsSchemaMode === "missing") {
      let fallbackItems = await listFallbackCarReservations({ force: true, admin: true });
      if (syncExpired) {
        const changed = await markExpiredCarReservations(fallbackItems);
        if (changed > 0) {
          fallbackItems = await listFallbackCarReservations({ force: true, admin: true });
        }
      }
      const filteredFallback = carId
        ? fallbackItems.filter((item) => item.carId === toStringValue(carId))
        : fallbackItems;
      await syncReservationDisplayOverridesFromItems(fallbackItems);
      return sortCarReservations(filteredFallback, "desc");
    }

    let items = Array.isArray(rows) ? rows.map(normalizeCarReservationRecord) : [];
    if (syncExpired) {
      const changed = await markExpiredCarReservations(items);
      if (changed > 0) {
        const refreshedRows = await requestCarReservationsRest({
          admin: true,
          allowMissing: true,
          select: CAR_RESERVATION_COLUMNS,
          order: "start_at.desc",
          filters: carId ? { car_id: `eq.${toStringValue(carId)}` } : {},
        });
        items = Array.isArray(refreshedRows) ? refreshedRows.map(normalizeCarReservationRecord) : [];
      }
    }
    await saveFallbackCarReservations(items, { preserveSchemaMode: true });
    await syncReservationDisplayOverridesFromItems(items);
    return items;
  };

  const assertCarReservationAvailability = async (payload, excludeId = "") => {
    if (!payload || !payload.car_id) {
      throw new Error("Araç seçilmelidir.");
    }

    if (normalizeCarReservationStatus(payload.status, "reserved") === "expired") {
      return;
    }

    const startTimestamp = toTimestamp(payload.start_at);
    const endTimestamp = toTimestamp(payload.end_at);
    if (startTimestamp === null || endTimestamp === null) {
      throw new Error("Başlangıç ve bitiş tarihi zorunludur.");
    }

    const existingItems = await listAdminCarReservations({
      carId: payload.car_id,
      syncExpired: false,
    });

    const conflict = existingItems.find((item) => {
      if (excludeId && item.id === excludeId) return false;
      if (getEffectiveCarReservationStatus(item) === "expired") return false;
      return rangesOverlap(startTimestamp, endTimestamp, toTimestamp(item.startDateTime), toTimestamp(item.endDateTime));
    });

    if (conflict) {
      throw new Error("Bu araç seçilen tarih aralığında müsait değil.");
    }
  };

  const createCarReservation = async (input) => {
    const payload = serializeCarReservationPayload(input);
    await assertCarReservationAvailability(payload);

    let rows;
    try {
      rows = await requestCarReservationsRest({
        admin: true,
        method: "POST",
        body: payload,
        select: CAR_RESERVATION_COLUMNS,
        prefer: "return=representation",
      });
    } catch (error) {
      if (!isMissingCarReservationsSchemaError(error)) {
        throw error;
      }
      const source = await listFallbackCarReservations({ force: true, admin: true });
      const nowIso = new Date().toISOString();
      const fallbackRecord = normalizeCarReservationRecord({
        id: createUuid(),
        ...payload,
        created_at: nowIso,
        updated_at: nowIso,
      });
      await saveFallbackCarReservations([...source, fallbackRecord]);
      return fallbackRecord;
    }

    publicCarReservationsCache = null;
    fallbackCarReservationsCache = null;
    await mirrorFullCarReservationsToFallback();
    await syncCarReservationDisplayOverride(payload.car_id);
    return Array.isArray(rows) && rows[0] ? normalizeCarReservationRecord(rows[0]) : null;
  };

  const updateCarReservation = async (id, input) => {
    const payload = serializeCarReservationPayload(input);
    await assertCarReservationAvailability(payload, toStringValue(id));

    let rows;
    try {
      rows = await requestCarReservationsRest({
        admin: true,
        method: "PATCH",
        filters: { id: `eq.${toStringValue(id)}` },
        body: payload,
        select: CAR_RESERVATION_COLUMNS,
        prefer: "return=representation",
      });
    } catch (error) {
      if (!isMissingCarReservationsSchemaError(error)) {
        throw error;
      }
      const source = await listFallbackCarReservations({ force: true, admin: true });
      const targetId = toStringValue(id);
      const target = source.find((item) => item.id === targetId);
      if (!target) return null;
      const fallbackRecord = normalizeCarReservationRecord({
        id: target.id,
        ...payload,
        created_at: target.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await saveFallbackCarReservations(source.map((item) => (item.id === targetId ? fallbackRecord : item)));
      return fallbackRecord;
    }

    publicCarReservationsCache = null;
    fallbackCarReservationsCache = null;
    await mirrorFullCarReservationsToFallback();
    await syncCarReservationDisplayOverride(payload.car_id);
    return Array.isArray(rows) && rows[0] ? normalizeCarReservationRecord(rows[0]) : null;
  };

  const deleteCarReservation = async (id) => {
    let deletedCarId = "";
    try {
      if (carReservationsSchemaMode === "full") {
        const existingRows = await requestCarReservationsRest({
          admin: true,
          select: CAR_RESERVATION_COLUMNS,
          filters: { id: `eq.${toStringValue(id)}` },
          allowMissing: true,
          limit: 1,
        });
        deletedCarId = Array.isArray(existingRows) && existingRows[0] ? toStringValue(existingRows[0].car_id) : "";
      }
      await requestCarReservationsRest({
        admin: true,
        method: "DELETE",
        filters: { id: `eq.${toStringValue(id)}` },
        prefer: "return=minimal",
      });
      fallbackCarReservationsCache = null;
    } catch (error) {
      if (!isMissingCarReservationsSchemaError(error)) {
        throw error;
      }
      const targetId = toStringValue(id);
      const source = await listFallbackCarReservations({ force: true, admin: true });
      const target = source.find((item) => item.id === targetId);
      deletedCarId = target ? toStringValue(target.carId) : deletedCarId;
      await saveFallbackCarReservations(source.filter((item) => item.id !== targetId));
    }
    publicCarReservationsCache = null;
    if (carReservationsSchemaMode === "full") {
      await mirrorFullCarReservationsToFallback();
    }
    if (deletedCarId) {
      await syncCarReservationDisplayOverride(deletedCarId);
    }
  };

  const createReservationLead = async (input) => {
    const rows = await requestRest("reservations", {
      method: "POST",
      select: "",
      body: serializeReservationPayload(input),
      prefer: "return=minimal",
    });

    return Array.isArray(rows) && rows[0] ? normalizeReservationRecord(rows[0]) : null;
  };

  const listAdminReservations = async () => {
    const rows = await requestRest("reservations", {
      admin: true,
      select: RESERVATION_COLUMNS,
      order: "created_at.desc",
    });

    return Array.isArray(rows) ? rows.map(normalizeReservationRecord) : [];
  };

  const updateReservationLead = async (id, partial = {}) => {
    const payload = {};
    if ("status" in partial) payload.status = normalizeReservationStatus(partial.status);
    if ("note" in partial) payload.note = toStringValue(partial.note);

    const rows = await requestRest("reservations", {
      admin: true,
      method: "PATCH",
      filters: { id: `eq.${toStringValue(id)}` },
      body: payload,
      select: RESERVATION_COLUMNS,
      prefer: "return=representation",
    });

    return Array.isArray(rows) && rows[0] ? normalizeReservationRecord(rows[0]) : null;
  };

  const getSiteContent = async (key, { admin = false, fallback = null } = {}) => {
    const cleanKey = toStringValue(key);
    if (!cleanKey) return cloneData(fallback);

    let rows;
    try {
      rows = await requestRest("site_content", {
        admin,
        select: SITE_CONTENT_COLUMNS,
        filters: {
          key: `eq.${cleanKey}`,
        },
        limit: 1,
        allowEmpty: true,
      });
      siteContentSchemaMode = "full";
    } catch (error) {
      if (!isMissingSiteContentTableError(error)) {
        throw error;
      }
      siteContentSchemaMode = "fallback";
      return readSiteContentFallback(cleanKey, fallback);
    }

    if (!Array.isArray(rows) || !rows[0]) {
      return readSiteContentFallback(cleanKey, fallback);
    }

    return rows[0].value !== undefined ? rows[0].value : cloneData(fallback);
  };

  const saveSiteContent = async (key, value) => {
    const cleanKey = toStringValue(key);
    if (!cleanKey) {
      throw new Error("Content key boş ola bilməz.");
    }

    let rows;
    try {
      rows = await requestRest("site_content", {
        admin: true,
        method: "POST",
        select: SITE_CONTENT_COLUMNS,
        filters: {
          on_conflict: "key",
        },
        body: {
          key: cleanKey,
          value,
        },
        prefer: "resolution=merge-duplicates,return=representation",
      });
      siteContentSchemaMode = "full";
    } catch (error) {
      if (!isMissingSiteContentTableError(error)) {
        throw error;
      }
      siteContentSchemaMode = "fallback";
      return writeSiteContentFallback(cleanKey, value);
    }

    const nextValue = Array.isArray(rows) && rows[0] ? rows[0].value : cloneData(value);
    writeSiteContentFallback(cleanKey, nextValue);
    return nextValue;
  };

  const getHomeSpotlightContent = async () => normalizeHomeSpotlightContent(
    await getSiteContent("home_spotlight", { fallback: DEFAULT_HOME_SPOTLIGHT }),
  );

  const saveHomeSpotlightContent = async (value) => saveSiteContent(
    "home_spotlight",
    normalizeHomeSpotlightContent(value),
  );

  const getHomeHeroContent = async () => normalizeHomeHeroContent(
    await getSiteContent("home_hero", { fallback: DEFAULT_HOME_HERO }),
  );

  const saveHomeHeroContent = async (value) => saveSiteContent(
    "home_hero",
    normalizeHomeHeroContent(value),
  );

  const getHomeCtaContent = async () => normalizeHomeCtaContent(
    await getSiteContent("home_cta", { fallback: DEFAULT_HOME_CTA }),
  );

  const saveHomeCtaContent = async (value) => saveSiteContent(
    "home_cta",
    normalizeHomeCtaContent(value),
  );

  const uploadImage = async (file, folder = "cars") => {
    if (!(file instanceof File)) {
      throw new Error("Sekil fayli secilmeyib.");
    }

    const config = await getConfig();
    const session = await ensureAdminSession();
    const extension = String(file.name || "image").split(".").pop().toLowerCase();
    const basename = slugify(String(file.name || "image").replace(/\.[^.]+$/, "")) || "image";
    const filePath = `${folder}/${Date.now()}-${basename}.${extension || "jpg"}`;

    const response = await fetch(
      `${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(config.storageBucket)}/${encodeStoragePath(filePath)}`,
      {
        method: "POST",
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "true",
        },
        body: file,
      }
    );

    await parseResponse(response);

    return {
      path: filePath,
      publicUrl: buildPublicAssetUrlInternal(config.supabaseUrl, config.storageBucket, filePath),
    };
  };

  const listMedia = async (folder = "cars") => {
    const config = await getConfig();
    const session = await ensureAdminSession();
    const response = await fetch(
      `${config.supabaseUrl}/storage/v1/object/list/${encodeURIComponent(config.storageBucket)}`,
      {
        method: "POST",
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 200,
          offset: 0,
          prefix: folder,
          sortBy: {
            column: "updated_at",
            order: "desc",
          },
        }),
      }
    );

    const rows = await parseResponse(response);
    if (!Array.isArray(rows)) return [];

    return rows
      .filter((item) => item && item.name)
      .map((item) => {
        const path = `${folder}/${item.name}`;
        return {
          name: item.name,
          path,
          url: buildPublicAssetUrlInternal(config.supabaseUrl, config.storageBucket, path),
          updatedAt: item.updated_at || item.created_at || "",
          metadata: item.metadata || {},
        };
      });
  };

  const deleteMedia = async (path) => {
    const cleanPath = toStringValue(path);
    if (!cleanPath) return;

    const config = await getConfig();
    const session = await ensureAdminSession();
    const response = await fetch(
      `${config.supabaseUrl}/storage/v1/object/${encodeURIComponent(config.storageBucket)}/${encodeStoragePath(cleanPath)}`,
      {
        method: "DELETE",
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    await parseResponse(response);
  };

  const extractStoragePathFromUrlInternal = (config, url) => {
    const marker = `/storage/v1/object/public/${encodeURIComponent(config.storageBucket)}/`;
    const stringUrl = String(url || "");
    if (!stringUrl.includes(marker)) return "";
    return decodeURIComponent(stringUrl.split(marker)[1].split("?")[0]);
  };

  window.RentacarData = {
    PUBLIC_CAR_COLUMNS,
    SITE_CONTENT_COLUMNS,
    RESERVATION_COLUMNS,
    DEFAULT_HOME_HERO: cloneData(DEFAULT_HOME_HERO),
    DEFAULT_HOME_CTA: cloneData(DEFAULT_HOME_CTA),
    DEFAULT_HOME_SPOTLIGHT: cloneData(DEFAULT_HOME_SPOTLIGHT),
    getConfig,
    getStoredSession,
    setStoredSession,
    clearStoredSession,
    isAdminSession,
    signInAdmin,
    ensureAdminSession,
    getCarsSchemaMode: () => carsSchemaMode,
    getSiteContentSchemaMode: () => siteContentSchemaMode,
    getCarReservationsSchemaMode: () => carReservationsSchemaMode,
    listPublishedCars,
    listPublicCarReservations,
    getPublishedCarBySlug,
    listAdminCars,
    createCar,
    updateCar,
    patchCar,
    deleteCar,
    listAdminCarReservations,
    createCarReservation,
    updateCarReservation,
    deleteCarReservation,
    markExpiredCarReservations,
    createReservationLead,
    listAdminReservations,
    updateReservationLead,
    getSiteContent,
    saveSiteContent,
    normalizeHomeSpotlightContent,
    normalizeHomeHeroContent,
    normalizeHomeCtaContent,
    getHomeHeroContent,
    saveHomeHeroContent,
    getHomeCtaContent,
    saveHomeCtaContent,
    getHomeSpotlightContent,
    saveHomeSpotlightContent,
    uploadImage,
    listMedia,
    deleteMedia,
    normalizeCarRecord,
    normalizeReservationRecord,
    normalizeCarReservationRecord,
    serializeCarPayload,
    serializeReservationPayload,
    serializeCarReservationPayload,
    normalizeAvailabilityStatus,
    normalizeCarReservationStatus,
    getEffectiveCarReservationStatus,
    buildCarReservationSummary,
    extractStoragePathFromUrl: async (url) => extractStoragePathFromUrlInternal(await getConfig(), url),
    buildPublicAssetUrl: async (path) => {
      const config = await getConfig();
      return buildPublicAssetUrlInternal(config.supabaseUrl, config.storageBucket, path);
    },
  };
})();
