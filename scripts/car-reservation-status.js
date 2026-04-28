(function () {
  const Data = window.RentacarData;
  if (!Data || Data.__simpleReservationPatchApplied) return;

  const STORAGE_KEY_PREFIX = "car_simple_reservation__";
  const LEGACY_STORE_KEY = "car_simple_reservations";
  const RESERVATION_FIELD_NAMES = [
    "isReserved",
    "reservationStartDateTime",
    "reservationEndDateTime",
    "reservationNote",
  ];

  const reservationRecordCache = new Map();
  let legacyReservationMapCache = null;

  const cloneData = (value) => {
    if (value === null || value === undefined) return value;
    return JSON.parse(JSON.stringify(value));
  };

  const toStringValue = (value) => String(value ?? "").trim();
  const pad2 = (value) => String(value).padStart(2, "0");

  const toDateTimeValue = (value) => {
    const clean = toStringValue(value);
    if (!clean) return "";

    const normalized = clean.replace(" ", "T");
    const directMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (directMatch) {
      return `${directMatch[1]}-${directMatch[2]}-${directMatch[3]}T${directMatch[4]}:${directMatch[5]}`;
    }

    const date = new Date(clean);
    if (Number.isNaN(date.getTime())) return "";

    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  };

  const toBoolean = (value) => (
    value === true
    || value === "true"
    || value === "on"
    || value === 1
    || value === "1"
  );

  const buildReservationIdentity = (carLike = {}) => ({
    id: toStringValue(carLike.id),
    slug: toStringValue(carLike.slug).toLowerCase(),
  });

  const buildStorageKey = (carLike = {}) => {
    const identity = buildReservationIdentity(carLike);
    if (identity.id) return `${STORAGE_KEY_PREFIX}id__${identity.id}`;
    if (identity.slug) return `${STORAGE_KEY_PREFIX}slug__${identity.slug}`;
    return "";
  };

  const buildLegacyMapKey = (carLike = {}) => {
    const identity = buildReservationIdentity(carLike);
    if (identity.id) return `id:${identity.id}`;
    if (identity.slug) return `slug:${identity.slug}`;
    return "";
  };

  const normalizeReservationRecord = (input = {}) => ({
    isReserved: toBoolean(input.isReserved ?? input.is_reserved),
    reservationStartDateTime: toDateTimeValue(
      input.reservationStartDateTime
      ?? input.reservation_start_at
      ?? input.startDateTime
      ?? input.start_at
    ),
    reservationEndDateTime: toDateTimeValue(
      input.reservationEndDateTime
      ?? input.reservation_end_at
      ?? input.endDateTime
      ?? input.end_at
    ),
    reservationNote: toStringValue(
      input.reservationNote
      ?? input.reservation_note
      ?? input.note
    ),
  });

  const normalizeReservationMap = (value) => {
    const source = value && typeof value === "object" ? value : {};
    return Object.entries(source).reduce((accumulator, [key, record]) => {
      const cleanKey = toStringValue(key);
      if (!cleanKey) return accumulator;
      accumulator[cleanKey] = normalizeReservationRecord(record || {});
      return accumulator;
    }, {});
  };

  const hasReservationFields = (input = {}) => RESERVATION_FIELD_NAMES.some((field) => field in input);
  const hasReservationPayload = (record = {}) => Boolean(
    record.isReserved
    || record.reservationStartDateTime
    || record.reservationEndDateTime
    || record.reservationNote
  );

  const stripReservationFields = (input = {}) => {
    const next = { ...input };
    RESERVATION_FIELD_NAMES.forEach((field) => {
      delete next[field];
    });
    return next;
  };

  const isReservationActive = (reservation, now = Date.now()) => {
    if (!reservation || !reservation.isReserved) return false;
    const endValue = toDateTimeValue(reservation.reservationEndDateTime);
    const endTimestamp = Date.parse(endValue);
    return Number.isFinite(endTimestamp) && endTimestamp > now;
  };

  const formatReservationDateTime = (value) => {
    const normalized = toDateTimeValue(value);
    if (!normalized) return "";
    const [datePart, timePart] = normalized.split("T");
    if (!datePart || !timePart) return "";
    const [year, month, day] = datePart.split("-");
    if (!year || !month || !day) return "";
    return `${day}.${month}.${year} ${timePart.slice(0, 5)}`;
  };

  const readReservationDraftFromAdminForm = () => {
    const dialog = document.querySelector('[data-dialog="car"]');
    const form = dialog && !dialog.hidden ? dialog.querySelector('[data-car-form]') : null;
    if (!form) return { hasFields: false, record: null };

    const reservedField = form.elements.namedItem("isReserved");
    const startField = form.elements.namedItem("reservationStartDateTime");
    const endField = form.elements.namedItem("reservationEndDateTime");
    const noteField = form.elements.namedItem("reservationNote");

    if (!reservedField || !startField || !endField || !noteField) {
      return { hasFields: false, record: null };
    }

    return {
      hasFields: true,
      record: normalizeReservationRecord({
        isReserved: reservedField.checked,
        reservationStartDateTime: startField.value,
        reservationEndDateTime: endField.value,
        reservationNote: noteField.value,
      }),
    };
  };

  const resolveReservationInput = (input = {}) => {
    if (hasReservationFields(input)) {
      return {
        hasFields: true,
        record: normalizeReservationRecord(input),
      };
    }
    if (typeof document !== "undefined") {
      return readReservationDraftFromAdminForm();
    }
    return { hasFields: false, record: null };
  };

  const getLegacyReservationMap = async ({ force = false } = {}) => {
    if (legacyReservationMapCache && !force) {
      return cloneData(legacyReservationMapCache);
    }
    const stored = await Data.getSiteContent(LEGACY_STORE_KEY, { fallback: {} }).catch(() => ({}));
    legacyReservationMapCache = normalizeReservationMap(stored);
    return cloneData(legacyReservationMapCache);
  };

  const readReservationRecord = async (storageKey, { force = false } = {}) => {
    if (!storageKey) return normalizeReservationRecord({});
    if (!force && reservationRecordCache.has(storageKey)) {
      return cloneData(reservationRecordCache.get(storageKey));
    }
    const stored = await Data.getSiteContent(storageKey, { fallback: {} }).catch(() => ({}));
    const normalized = normalizeReservationRecord(stored || {});
    reservationRecordCache.set(storageKey, normalized);
    return cloneData(normalized);
  };

  const getSimpleReservationForCar = async (carLike, { force = false } = {}) => {
    const storageKey = buildStorageKey(carLike);
    const directRecord = await readReservationRecord(storageKey, { force });
    if (hasReservationPayload(directRecord)) {
      return normalizeReservationRecord(directRecord);
    }

    const legacyMap = await getLegacyReservationMap({ force });
    const legacyRecord = normalizeReservationRecord(legacyMap[buildLegacyMapKey(carLike)] || {});
    if (hasReservationPayload(legacyRecord) && storageKey) {
      reservationRecordCache.set(storageKey, legacyRecord);
      return cloneData(legacyRecord);
    }

    return normalizeReservationRecord({});
  };

  const saveSimpleReservationForCar = async (carLike, input) => {
    const storageKey = buildStorageKey(carLike);
    if (!storageKey) return normalizeReservationRecord({});

    const normalized = normalizeReservationRecord(input || {});
    const payload = normalized.isReserved ? normalized : {};

    await Data.saveSiteContent(storageKey, payload);
    reservationRecordCache.set(storageKey, normalized);
    return cloneData(normalized);
  };

  const deleteSimpleReservationForCar = async (carLike) => {
    await saveSimpleReservationForCar(carLike, {});
  };

  const decorateCarWithSimpleReservation = (car, reservation = null) => {
    if (!car || typeof car !== "object") return car;
    const storageKey = buildStorageKey(car);
    const cachedRecord = reservation
      || (storageKey ? reservationRecordCache.get(storageKey) : null)
      || (legacyReservationMapCache && legacyReservationMapCache[buildLegacyMapKey(car)])
      || {};
    const normalized = normalizeReservationRecord(cachedRecord);
    return {
      ...car,
      ...normalized,
      reservationActive: isReservationActive(normalized),
    };
  };

  const decorateCarsWithReservations = async (cars, { force = false } = {}) => {
    const source = Array.isArray(cars) ? cars : [];
    return Promise.all(source.map(async (car) => {
      const reservation = await getSimpleReservationForCar(car, { force });
      return decorateCarWithSimpleReservation(car, reservation);
    }));
  };

  const originalListPublishedCars = Data.listPublishedCars ? Data.listPublishedCars.bind(Data) : null;
  const originalListAdminCars = Data.listAdminCars ? Data.listAdminCars.bind(Data) : null;
  const originalGetPublishedCarBySlug = Data.getPublishedCarBySlug ? Data.getPublishedCarBySlug.bind(Data) : null;
  const originalCreateCar = Data.createCar ? Data.createCar.bind(Data) : null;
  const originalUpdateCar = Data.updateCar ? Data.updateCar.bind(Data) : null;
  const originalPatchCar = Data.patchCar ? Data.patchCar.bind(Data) : null;
  const originalDeleteCar = Data.deleteCar ? Data.deleteCar.bind(Data) : null;

  if (originalListPublishedCars) {
    Data.listPublishedCars = async (...args) => {
      const cars = await originalListPublishedCars(...args);
      return decorateCarsWithReservations(cars, { force: true });
    };
  }

  if (originalListAdminCars) {
    Data.listAdminCars = async (...args) => {
      const cars = await originalListAdminCars(...args);
      return decorateCarsWithReservations(cars, { force: true });
    };
  }

  if (originalGetPublishedCarBySlug) {
    Data.getPublishedCarBySlug = async (...args) => {
      const car = await originalGetPublishedCarBySlug(...args);
      if (!car) return car;
      const reservation = await getSimpleReservationForCar(car, { force: true });
      return decorateCarWithSimpleReservation(car, reservation);
    };
  }

  const persistReservationAndDecorate = async (savedCar, reservationInput) => {
    if (!savedCar) return savedCar;
    if (reservationInput.hasFields) {
      await saveSimpleReservationForCar(savedCar, reservationInput.record);
    }
    const reservation = await getSimpleReservationForCar(savedCar, { force: true });
    return decorateCarWithSimpleReservation(savedCar, reservation);
  };

  if (originalCreateCar) {
    Data.createCar = async (input = {}) => {
      const reservationInput = resolveReservationInput(input);
      const savedCar = await originalCreateCar(stripReservationFields(input));
      return persistReservationAndDecorate(savedCar, reservationInput);
    };
  }

  if (originalUpdateCar) {
    Data.updateCar = async (id, input = {}) => {
      const reservationInput = resolveReservationInput(input);
      const savedCar = await originalUpdateCar(id, stripReservationFields(input));
      return persistReservationAndDecorate(savedCar, reservationInput);
    };
  }

  if (originalPatchCar) {
    Data.patchCar = async (id, partial = {}) => {
      const reservationInput = resolveReservationInput(partial);
      const savedCar = await originalPatchCar(id, stripReservationFields(partial));
      return persistReservationAndDecorate(savedCar, reservationInput);
    };
  }

  if (originalDeleteCar) {
    Data.deleteCar = async (id, slug = "") => {
      await originalDeleteCar(id, slug);
      await deleteSimpleReservationForCar({ id, slug });
    };
  }

  Data.__simpleReservationPatchApplied = true;
  Data.getSimpleReservationForCar = getSimpleReservationForCar;
  Data.saveSimpleReservationForCar = saveSimpleReservationForCar;
  Data.deleteSimpleReservationForCar = deleteSimpleReservationForCar;
  Data.normalizeSimpleReservationRecord = normalizeReservationRecord;
  Data.decorateCarWithSimpleReservation = decorateCarWithSimpleReservation;
  Data.isSimpleReservationActive = isReservationActive;
  Data.formatSimpleReservationDateTime = formatReservationDateTime;
})();