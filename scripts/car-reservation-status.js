(function () {
  const Data = window.RentacarData;
  if (!Data || Data.__simpleReservationPatchApplied) return;

  const STORE_KEY = "car_simple_reservations";
  const RESERVATION_FIELD_NAMES = [
    "isReserved",
    "reservationStartDateTime",
    "reservationEndDateTime",
    "reservationNote",
  ];

  let reservationMapCache = null;

  const cloneData = (value) => {
    if (value === null || value === undefined) return value;
    return JSON.parse(JSON.stringify(value));
  };

  const toStringValue = (value) => String(value ?? "").trim();

  const toIsoString = (value) => {
    const clean = toStringValue(value);
    if (!clean) return "";
    const date = new Date(clean);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  };

  const toBoolean = (value) => (
    value === true
    || value === "true"
    || value === "on"
    || value === 1
    || value === "1"
  );

  const buildReservationKey = (carLike) => {
    const id = toStringValue(carLike && carLike.id);
    if (id) return `id:${id}`;
    const slug = toStringValue(carLike && carLike.slug).toLowerCase();
    if (slug) return `slug:${slug}`;
    return "";
  };

  const normalizeReservationRecord = (input = {}) => ({
    isReserved: toBoolean(input.isReserved ?? input.is_reserved),
    reservationStartDateTime: toIsoString(
      input.reservationStartDateTime
      ?? input.reservation_start_at
      ?? input.startDateTime
      ?? input.start_at
    ),
    reservationEndDateTime: toIsoString(
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

  const stripReservationFields = (input = {}) => {
    const next = { ...input };
    RESERVATION_FIELD_NAMES.forEach((field) => {
      delete next[field];
    });
    return next;
  };

  const isReservationActive = (reservation, now = Date.now()) => {
    if (!reservation || !reservation.isReserved) return false;
    const endTimestamp = Date.parse(toStringValue(reservation.reservationEndDateTime));
    return Number.isFinite(endTimestamp) && endTimestamp > now;
  };

  const formatReservationDateTime = (value, locale = "az-AZ", timeZone = "Asia/Baku") => {
    const isoValue = toIsoString(value);
    if (!isoValue) return "";
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
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

  const getSimpleReservationMap = async ({ force = false } = {}) => {
    if (reservationMapCache && !force) {
      return cloneData(reservationMapCache);
    }
    const stored = await Data.getSiteContent(STORE_KEY, { fallback: {} }).catch(() => ({}));
    reservationMapCache = normalizeReservationMap(stored);
    return cloneData(reservationMapCache);
  };

  const saveSimpleReservationMap = async (nextMap) => {
    reservationMapCache = normalizeReservationMap(nextMap);
    await Data.saveSiteContent(STORE_KEY, reservationMapCache);
    return cloneData(reservationMapCache);
  };

  const getSimpleReservationForCar = async (carLike, { force = false } = {}) => {
    const map = await getSimpleReservationMap({ force });
    const idKey = buildReservationKey({ id: carLike && carLike.id });
    const slugKey = buildReservationKey({ slug: carLike && carLike.slug });
    return normalizeReservationRecord(map[idKey] || map[slugKey] || {});
  };

  const saveSimpleReservationForCar = async (carLike, input) => {
    const map = await getSimpleReservationMap({ force: true });
    const nextMap = { ...map };
    const idKey = buildReservationKey({ id: carLike && carLike.id });
    const slugKey = buildReservationKey({ slug: carLike && carLike.slug });
    const normalized = normalizeReservationRecord(input || {});

    if (idKey) delete nextMap[idKey];
    if (slugKey) delete nextMap[slugKey];

    if (normalized.isReserved) {
      const targetKey = idKey || slugKey;
      if (targetKey) nextMap[targetKey] = normalized;
    }

    await saveSimpleReservationMap(nextMap);
    return normalized;
  };

  const deleteSimpleReservationForCar = async (carLike) => {
    const map = await getSimpleReservationMap({ force: true });
    const nextMap = { ...map };
    const idKey = buildReservationKey({ id: carLike && carLike.id });
    const slugKey = buildReservationKey({ slug: carLike && carLike.slug });
    if (idKey) delete nextMap[idKey];
    if (slugKey) delete nextMap[slugKey];
    await saveSimpleReservationMap(nextMap);
  };

  const decorateCarWithSimpleReservation = (car, map = reservationMapCache || {}) => {
    if (!car || typeof car !== "object") return car;
    const idKey = buildReservationKey({ id: car.id });
    const slugKey = buildReservationKey({ slug: car.slug });
    const reservation = normalizeReservationRecord(map[idKey] || map[slugKey] || {});
    return {
      ...car,
      ...reservation,
      reservationActive: isReservationActive(reservation),
    };
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
      const map = await getSimpleReservationMap();
      return Array.isArray(cars) ? cars.map((car) => decorateCarWithSimpleReservation(car, map)) : [];
    };
  }

  if (originalListAdminCars) {
    Data.listAdminCars = async (...args) => {
      const cars = await originalListAdminCars(...args);
      const map = await getSimpleReservationMap();
      return Array.isArray(cars) ? cars.map((car) => decorateCarWithSimpleReservation(car, map)) : [];
    };
  }

  if (originalGetPublishedCarBySlug) {
    Data.getPublishedCarBySlug = async (...args) => {
      const car = await originalGetPublishedCarBySlug(...args);
      if (!car) return car;
      const map = await getSimpleReservationMap();
      return decorateCarWithSimpleReservation(car, map);
    };
  }

  if (originalCreateCar) {
    Data.createCar = async (input = {}) => {
      const reservationInput = resolveReservationInput(input);
      const savedCar = await originalCreateCar(stripReservationFields(input));
      if (savedCar && reservationInput.hasFields) {
        await saveSimpleReservationForCar(savedCar, reservationInput.record);
      }
      const map = await getSimpleReservationMap();
      return savedCar ? decorateCarWithSimpleReservation(savedCar, map) : savedCar;
    };
  }

  if (originalUpdateCar) {
    Data.updateCar = async (id, input = {}) => {
      const reservationInput = resolveReservationInput(input);
      const savedCar = await originalUpdateCar(id, stripReservationFields(input));
      if (savedCar && reservationInput.hasFields) {
        await saveSimpleReservationForCar(savedCar, reservationInput.record);
      }
      const map = await getSimpleReservationMap();
      return savedCar ? decorateCarWithSimpleReservation(savedCar, map) : savedCar;
    };
  }

  if (originalPatchCar) {
    Data.patchCar = async (id, partial = {}) => {
      const reservationInput = resolveReservationInput(partial);
      const savedCar = await originalPatchCar(id, stripReservationFields(partial));
      if (savedCar && reservationInput.hasFields) {
        await saveSimpleReservationForCar(savedCar, reservationInput.record);
      }
      const map = await getSimpleReservationMap();
      return savedCar ? decorateCarWithSimpleReservation(savedCar, map) : savedCar;
    };
  }

  if (originalDeleteCar) {
    Data.deleteCar = async (id, slug = "") => {
      await originalDeleteCar(id, slug);
      await deleteSimpleReservationForCar({ id, slug });
    };
  }

  Data.__simpleReservationPatchApplied = true;
  Data.getSimpleReservationMap = getSimpleReservationMap;
  Data.saveSimpleReservationMap = saveSimpleReservationMap;
  Data.getSimpleReservationForCar = getSimpleReservationForCar;
  Data.saveSimpleReservationForCar = saveSimpleReservationForCar;
  Data.deleteSimpleReservationForCar = deleteSimpleReservationForCar;
  Data.normalizeSimpleReservationRecord = normalizeReservationRecord;
  Data.decorateCarWithSimpleReservation = decorateCarWithSimpleReservation;
  Data.isSimpleReservationActive = isReservationActive;
  Data.formatSimpleReservationDateTime = formatReservationDateTime;
})();