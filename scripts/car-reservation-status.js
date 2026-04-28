(function () {
  const Data = window.RentacarData;
  if (!Data || Data.__simpleReservationPatchApplied) return;

  Data.__simpleReservationPatchApplied = true;

  const CONTENT_KEY = "car_simple_reservations";
  const BAKU_TIMEZONE = "Asia/Baku";

  let reservationMapCache = null;
  let reservationMapPromise = null;

  const toText = (value) => String(value ?? "").trim();
  const slugify = (value) => toText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const toIsoString = (value) => {
    const clean = toText(value);
    if (!clean) return "";
    const date = new Date(clean);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  };

  const normalizeReservation = (input = {}) => ({
    isReserved: Boolean(input.isReserved),
    reservationStartDateTime: toIsoString(
      input.reservationStartDateTime || input.reservationStartAt || input.startAt || input.start
    ),
    reservationEndDateTime: toIsoString(
      input.reservationEndDateTime || input.reservationEndAt || input.endAt || input.end
    ),
    reservationNote: toText(input.reservationNote || input.note),
    updatedAt: toIsoString(input.updatedAt) || new Date().toISOString(),
    carId: toText(input.carId),
    slug: toText(input.slug),
  });

  const extractMapSource = (payload) => {
    if (!payload || typeof payload !== "object") return {};
    if (payload.value && typeof payload.value === "object" && !Array.isArray(payload.value)) {
      return payload.value;
    }
    return Array.isArray(payload) ? {} : payload;
  };

  const normalizeReservationMap = (payload) => {
    const source = extractMapSource(payload);
    const nextMap = {};
    Object.entries(source).forEach(([key, value]) => {
      nextMap[key] = normalizeReservation(value);
    });
    return nextMap;
  };

  const buildCarKey = (car) => {
    if (!car) return "";
    const id = toText(car.id || car.carId);
    if (id) return `car:${id}`;
    const slug = slugify(car.slug || car.carSlug || car.title);
    return slug ? `slug:${slug}` : "";
  };

  const getSlugKey = (value) => {
    const slug = slugify(value);
    return slug ? `slug:${slug}` : "";
  };

  const getReservationEndMs = (entry) => {
    const date = new Date(entry && entry.reservationEndDateTime);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const isReservationActive = (entry, reference = Date.now()) => (
    Boolean(entry && entry.isReserved && getReservationEndMs(entry) > reference)
  );

  const findReservationEntry = (map, car) => {
    if (!car || !map) return null;

    const directKey = buildCarKey(car);
    if (directKey && map[directKey]) return map[directKey];

    const slugKey = getSlugKey(car.slug || car.title);
    if (slugKey && map[slugKey]) return map[slugKey];

    const id = toText(car.id || car.carId);
    const slug = slugify(car.slug || car.title);

    return Object.values(map).find((entry) => (
      (id && toText(entry.carId) === id) || (slug && slugify(entry.slug) === slug)
    )) || null;
  };

  const removeReservationEntry = (map, car) => {
    const nextMap = { ...map };
    const id = toText(car && (car.id || car.carId));
    const slug = slugify(car && (car.slug || car.title));

    Object.keys(nextMap).forEach((key) => {
      const entry = nextMap[key];
      const matchesId = id && toText(entry && entry.carId) === id;
      const matchesSlug = slug && slugify(entry && entry.slug) === slug;
      if (matchesId || matchesSlug || key === buildCarKey(car) || key === getSlugKey(slug)) {
        delete nextMap[key];
      }
    });

    return nextMap;
  };

  const decorateCar = (car, map = reservationMapCache || {}) => {
    if (!car || typeof car !== "object") return car;
    const entry = findReservationEntry(map, car);
    const normalized = entry ? normalizeReservation(entry) : normalizeReservation({});
    return {
      ...car,
      isReserved: normalized.isReserved,
      reservationStartDateTime: normalized.reservationStartDateTime,
      reservationEndDateTime: normalized.reservationEndDateTime,
      reservationNote: normalized.reservationNote,
      reservationActive: isReservationActive(normalized),
    };
  };

  const readReservationMap = async ({ force = false } = {}) => {
    if (!force && reservationMapCache) return reservationMapCache;
    if (!force && reservationMapPromise) return reservationMapPromise;

    reservationMapPromise = (async () => {
      try {
        const payload = await Data.getSiteContent(CONTENT_KEY, { force, fallback: {} });
        reservationMapCache = normalizeReservationMap(payload);
      } catch {
        reservationMapCache = {};
      }
      return reservationMapCache;
    })();

    try {
      return await reservationMapPromise;
    } finally {
      reservationMapPromise = null;
    }
  };

  const writeReservationMap = async (nextMap) => {
    const normalized = normalizeReservationMap(nextMap);
    reservationMapCache = normalized;
    await Data.saveSiteContent(CONTENT_KEY, normalized);
    return reservationMapCache;
  };

  const saveReservationForCar = async (car, reservationInput = {}) => {
    if (!car || typeof Data.saveSiteContent !== "function") return null;

    const normalized = normalizeReservation({
      ...reservationInput,
      carId: car.id,
      slug: car.slug,
    });

    const hasContent = normalized.isReserved
      || normalized.reservationStartDateTime
      || normalized.reservationEndDateTime
      || normalized.reservationNote;

    let nextMap = removeReservationEntry(await readReservationMap(), car);

    if (hasContent) {
      nextMap[buildCarKey(car)] = normalized;
      if (car.slug) nextMap[getSlugKey(car.slug)] = normalized;
    }

    await writeReservationMap(nextMap);
    return normalized;
  };

  const getReservationForCar = async (car, options = {}) => {
    const map = await readReservationMap(options);
    return normalizeReservation(findReservationEntry(map, car) || {});
  };

  const formatReservationDateTime = (value, locale = "az-AZ") => {
    const clean = toText(value);
    if (!clean) return "";
    const date = new Date(clean);
    if (Number.isNaN(date.getTime())) return clean;
    return new Intl.DateTimeFormat(locale, {
      timeZone: BAKU_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const stripReservationFields = (payload) => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
    const next = { ...payload };
    delete next.isReserved;
    delete next.reservationStartDateTime;
    delete next.reservationEndDateTime;
    delete next.reservationNote;
    return next;
  };

  const captureReservationDraft = (payload) => {
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      const hasDirectFields = [
        "isReserved",
        "reservationStartDateTime",
        "reservationEndDateTime",
        "reservationNote",
      ].some((key) => Object.prototype.hasOwnProperty.call(payload, key));
      if (hasDirectFields) return normalizeReservation(payload);
    }

    const form = document.querySelector("[data-car-form]");
    if (!form) return normalizeReservation({});

    return normalizeReservation({
      isReserved: Boolean(form.elements.namedItem("isReserved") && form.elements.namedItem("isReserved").checked),
      reservationStartDateTime: form.elements.namedItem("reservationStartDateTime") && form.elements.namedItem("reservationStartDateTime").value,
      reservationEndDateTime: form.elements.namedItem("reservationEndDateTime") && form.elements.namedItem("reservationEndDateTime").value,
      reservationNote: form.elements.namedItem("reservationNote") && form.elements.namedItem("reservationNote").value,
    });
  };

  const resolveSavedCar = (result, args, payloadIndex) => {
    const payload = args[payloadIndex] || {};
    if (result && typeof result === "object" && !Array.isArray(result)) {
      return result;
    }
    return {
      id: args[0] || payload.id || "",
      slug: payload.slug || "",
      title: payload.title || "",
    };
  };

  const wrapCarPersistence = (methodName) => {
    const original = typeof Data[methodName] === "function" ? Data[methodName].bind(Data) : null;
    if (!original) return;

    Data[methodName] = async (...args) => {
      const payloadIndex = args.length - 1;
      const reservationDraft = captureReservationDraft(args[payloadIndex]);
      if (payloadIndex >= 0) {
        args[payloadIndex] = stripReservationFields(args[payloadIndex]);
      }

      const result = await original(...args);
      const savedCar = resolveSavedCar(result, args, payloadIndex);
      await saveReservationForCar(savedCar, reservationDraft);
      return decorateCar(result);
    };
  };

  const wrapCarDelete = () => {
    const original = typeof Data.deleteCar === "function" ? Data.deleteCar.bind(Data) : null;
    if (!original) return;

    Data.deleteCar = async (...args) => {
      const result = await original(...args);
      try {
        const nextMap = removeReservationEntry(await readReservationMap(), {
          id: args[0],
          slug: args[1],
        });
        await writeReservationMap(nextMap);
      } catch {
        // ignore cleanup failure
      }
      return result;
    };
  };

  const wrapCarReads = () => {
    const originalListPublishedCars = typeof Data.listPublishedCars === "function" ? Data.listPublishedCars.bind(Data) : null;
    const originalListAdminCars = typeof Data.listAdminCars === "function" ? Data.listAdminCars.bind(Data) : null;
    const originalGetPublishedCarBySlug = typeof Data.getPublishedCarBySlug === "function" ? Data.getPublishedCarBySlug.bind(Data) : null;

    if (originalListPublishedCars) {
      Data.listPublishedCars = async (...args) => {
        const [cars, map] = await Promise.all([
          originalListPublishedCars(...args).catch(() => []),
          readReservationMap(),
        ]);
        return Array.isArray(cars) ? cars.map((car) => decorateCar(car, map)) : [];
      };
    }

    if (originalListAdminCars) {
      Data.listAdminCars = async (...args) => {
        const [cars, map] = await Promise.all([
          originalListAdminCars(...args).catch(() => []),
          readReservationMap(),
        ]);
        return Array.isArray(cars) ? cars.map((car) => decorateCar(car, map)) : [];
      };
    }

    if (originalGetPublishedCarBySlug) {
      Data.getPublishedCarBySlug = async (...args) => {
        const [car, map] = await Promise.all([
          originalGetPublishedCarBySlug(...args).catch(() => null),
          readReservationMap(),
        ]);
        return car ? decorateCar(car, map) : null;
      };
    }
  };

  Data.getSimpleReservationMap = readReservationMap;
  Data.getSimpleReservationForCar = getReservationForCar;
  Data.saveSimpleReservationForCar = saveReservationForCar;
  Data.formatSimpleReservationDateTime = formatReservationDateTime;
  Data.isSimpleReservationActive = (reservation) => isReservationActive(normalizeReservation(reservation));
  Data.decorateCarWithSimpleReservation = async (car) => decorateCar(car, await readReservationMap());

  wrapCarReads();
  wrapCarPersistence("createCar");
  wrapCarPersistence("updateCar");
  wrapCarPersistence("patchCar");
  wrapCarDelete();
})();
