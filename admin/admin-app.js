(() => {
  const Data = window.RentacarData;
  const Auth = window.RentacarAdminAuth;
  if (!Data || !Auth) return;

  const THEME_KEY = "rentacar-admin-theme-v5";
  const LAST_ERROR_KEY = "rentacar-admin-last-error";
  const PUBLIC_SYNC_CHANNEL = "rentacar-public-sync-v1";
  const PUBLIC_SYNC_STORAGE_KEY = "rentacar-public-sync-event-v1";
  const ROUTES = ["dashboard", "cars", "reservations", "media", "settings"];
  const CATEGORY_LABELS = {
    economy: "Ekonom",
    sedan: "Sedan",
    suv: "SUV",
    premium: "Premium",
    minivan: "Minivan",
  };
  const STATUS_LABELS = {
    draft: "Qaralama",
    published: "Saytda",
    archived: "Arxiv",
  };
  const CAR_UI_STATUS_LABELS = {
    active: "Aktivdir",
    rented: "İcarədədir",
    archived: "Arxiv",
  };
  const AVAILABILITY_LABELS = {
    available: "Aktivdir",
    rented: "İcarədədir",
    unavailable: "Arxiv",
  };
  const AVAILABILITY_BADGE_CLASSES = {
    available: "admin-badge admin-badge--available",
    rented: "admin-badge admin-badge--rented",
    unavailable: "admin-badge admin-badge--unavailable",
  };
  const RESERVATION_STATUS_LABELS = {
    new: "Yeni",
    reviewed: "Baxıldı",
    spam: "Saxta",
    archived: "Arxiv",
  };

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[match]));

  const state = {
    route: Auth.sanitizeRoute(window.location.hash.slice(1)),
    theme: localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light",
    cars: [],
    reservations: [],
    media: [],
    config: null,
    homeHero: Data.normalizeHomeHeroContent(Data.DEFAULT_HOME_HERO),
    homeSpotlight: Data.normalizeHomeSpotlightContent(Data.DEFAULT_HOME_SPOTLIGHT),
    homeCta: Data.normalizeHomeCtaContent(Data.DEFAULT_HOME_CTA),
    filters: {
      search: "",
      category: "all",
      status: "all",
      reservationSearch: "",
      reservationStatus: "all",
      mediaSearch: "",
    },
    draft: null,
  };

  const refs = {};
  let publicSyncChannel = null;

  const notifyPublicSiteChange = (type = "content") => {
    const payload = {
      type,
      at: Date.now(),
    };

    try {
      if (!publicSyncChannel && "BroadcastChannel" in window) {
        publicSyncChannel = new BroadcastChannel(PUBLIC_SYNC_CHANNEL);
      }
      if (publicSyncChannel) {
        publicSyncChannel.postMessage(payload);
      }
    } catch {
      // ignore sync channel issues
    }

    try {
      localStorage.setItem(PUBLIC_SYNC_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage issues
    }
  };

  const formatPrice = (value, fallback = "Sorğu üzrə") => {
    if (value === null || value === undefined || value === "") return fallback;
    return `${Number(value).toFixed(2)} AZN`;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("az-AZ", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  const excerpt = (value, limit = 110) => {
    const text = String(value || "").trim();
    if (text.length <= limit) return text;
    return `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
  };

  const formatCityLabel = (value) => {
    const clean = String(value || "").trim();
    if (!clean) return "Bakı";
    return clean.toLowerCase() === "baku" ? "Bakı" : clean;
  };

  const resolveAvailabilityStatus = (value) => {
    const clean = String(value || "").trim().toLowerCase();
    if (["available", "rented", "unavailable"].includes(clean)) return clean;
    return "available";
  };

  const getAvailabilityLabel = (value) => AVAILABILITY_LABELS[resolveAvailabilityStatus(value)] || "Aktivdir";

  const getAvailabilityBadgeClass = (value) => (
    AVAILABILITY_BADGE_CLASSES[resolveAvailabilityStatus(value)]
    || "admin-badge admin-badge--available"
  );

  const getCarUiStatus = (car) => {
    const rawStatus = String(car && car.status || "").toLowerCase();
    if (!car || rawStatus === "archived" || rawStatus !== "published") return "archived";
    return resolveAvailabilityStatus(car.availabilityStatus) === "rented" ? "rented" : "active";
  };

  const getReservationStatusClass = (status) => {
    const tone = String(status || "new").toLowerCase();
    return `admin-status-pill admin-status-pill--${tone}`;
  };

  const slugify = (value) => String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const createPreviewUrl = (file) => URL.createObjectURL(file);

  const revokeDraftUrls = (draft) => {
    if (!draft) return;
    draft.galleryItems
      .filter((item) => item.file && item.preview && item.preview.startsWith("blob:"))
      .forEach((item) => URL.revokeObjectURL(item.preview));

    if (draft.coverFile && draft.coverPreview && draft.coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(draft.coverPreview);
    }
  };

  const createDraft = (car) => ({
    id: car ? car.id : "",
    coverUrl: car ? car.coverImageUrl : "",
    coverFile: null,
    coverPreview: car ? car.coverImageUrl : "",
    galleryItems: car
      ? car.galleryImages.map((url, index) => ({ key: `existing-${index}`, url, file: null, preview: url }))
      : [],
  });

  const getUsageCount = (mediaUrl) => state.cars.reduce((count, car) => {
    const galleryHits = Array.isArray(car.galleryImages) ? car.galleryImages.filter((url) => url === mediaUrl).length : 0;
    return count + (car.coverImageUrl === mediaUrl ? 1 : 0) + galleryHits;
  }, 0);

  const getStatusClass = (status) => `admin-status-pill admin-status-pill--${String(status || "draft").toLowerCase()}`;

  const setTheme = (theme) => {
    state.theme = theme === "dark" ? "dark" : "light";
    document.body.dataset.adminTheme = state.theme;
    localStorage.setItem(THEME_KEY, state.theme);

    if (refs.themeIcon) refs.themeIcon.textContent = state.theme === "dark" ? "☀" : "☾";
    if (refs.themeButton) {
      const label = state.theme === "dark" ? "İşıqlı rejim" : "Gecə rejimi";
      refs.themeButton.setAttribute("aria-label", label);
      refs.themeButton.setAttribute("title", label);
    }

    const meta = qs('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", state.theme === "dark" ? "#111827" : "#ff6436");
  };

  const collectRefs = () => {
    refs.pageTitle = qs("[data-page-title]");
    refs.appFeedback = qs("[data-app-feedback]");
    refs.routeButtons = qsa("[data-route]");
    refs.views = qsa("[data-view]");
    refs.themeButton = qs("[data-theme-toggle]");
    refs.themeIcon = qs("[data-theme-toggle-icon]");
    refs.logoutButton = qs("[data-admin-logout]");
    refs.dashboardMetrics = qs("[data-dashboard-metrics]");
    refs.dashboardRecent = qs("[data-dashboard-recent]");
    refs.carsSearch = qs("[data-cars-search]");
    refs.carsCategory = qs("[data-cars-category]");
    refs.carsStatus = qs("[data-cars-status]");
    refs.carsList = qs("[data-cars-list]");
    refs.carsEmpty = qs("[data-cars-empty]");
    refs.reservationsSearch = qs("[data-reservations-search]");
    refs.reservationsStatus = qs("[data-reservations-status]");
    refs.reservationsList = qs("[data-reservations-list]");
    refs.reservationsEmpty = qs("[data-reservations-empty]");
    refs.mediaSearch = qs("[data-media-search]");
    refs.mediaInput = qs("[data-media-input]");
    refs.mediaGrid = qs("[data-media-grid]");
    refs.mediaEmpty = qs("[data-media-empty]");
    refs.settingsStatus = qs("[data-settings-status]");
    refs.settingsChecklist = qs("[data-settings-checklist]");
    refs.settingsForm = qs("[data-settings-form]");
    refs.settingsFeedback = qs("[data-settings-feedback]");
    refs.settingsImagePreview = qs("[data-settings-image-preview]");
    refs.settingsMediaPicker = qs("[data-settings-media-picker]");
    refs.carDialog = qs("[data-dialog='car']");
    refs.carForm = qs("[data-car-form]");
    refs.carDialogTitle = qs("[data-car-dialog-title]");
    refs.carDialogMode = qs("[data-car-dialog-mode]");
    refs.carFeedback = qs("[data-car-feedback]");
    refs.coverInput = qs("[data-cover-input]");
    refs.galleryInput = qs("[data-gallery-input]");
    refs.coverPreview = qs("[data-cover-preview]");
    refs.galleryPreview = qs("[data-gallery-preview]");
    refs.mediaPicker = qs("[data-media-picker]");
  };

  const showRoute = (route, updateHash = true) => {
    state.route = ROUTES.includes(route) ? route : "dashboard";
    refs.routeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.route === state.route);
    });
    refs.views.forEach((view) => {
      view.classList.toggle("is-active", view.dataset.view === state.route);
    });

    if (refs.pageTitle) {
      const currentButton = refs.routeButtons.find((button) => button.dataset.route === state.route);
      refs.pageTitle.textContent = currentButton ? currentButton.textContent.trim() : "Admin panel";
    }

    if (updateHash) {
      window.location.hash = state.route;
    }
  };

  const setInlineFeedback = (message = "", tone = "") => {
    if (!refs.carFeedback) return;
    refs.carFeedback.textContent = message;
    refs.carFeedback.classList.remove("is-success", "is-error");
    if (tone) refs.carFeedback.classList.add(tone);
  };

  const setAppFeedback = (message = "", tone = "") => {
    if (!refs.appFeedback) return;
    refs.appFeedback.textContent = message;
    refs.appFeedback.hidden = !message;
    refs.appFeedback.classList.remove("is-success", "is-error");
    if (message && tone) refs.appFeedback.classList.add(tone);
  };

  const renderDashboard = () => {
    if (!refs.dashboardMetrics || !refs.dashboardRecent) return;

    const activeCars = state.cars.filter((car) => getCarUiStatus(car) === "active").length;
    const rentedCars = state.cars.filter((car) => getCarUiStatus(car) === "rented").length;
    const newReservations = state.reservations.filter((item) => item.status === "new").length;

    refs.dashboardMetrics.innerHTML = [
      ["Bütün modellər", state.cars.length, "Supabase cars cədvəlindən gəlir"],
      ["Aktiv maşın", activeCars, "Public saytda rezervasiya üçün açıqdır"],
      ["İcarədə", rentedCars, "Saytda görünür, amma rezervasiya bağlanır"],
      ["Yeni rezerv", newReservations, "Müştəridən yeni gələn müraciətlər"],
    ].map(([label, value, note]) => `
      <article class="admin-metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(note)}</small>
      </article>
    `).join("");

    const latest = state.cars.slice(0, 4);
    refs.dashboardRecent.innerHTML = latest.length
      ? latest.map((car) => `
        <article class="admin-history-item">
          <strong>${escapeHtml(car.title)}</strong>
          <span>${escapeHtml(getCategoryLabel(car.category))} • ${escapeHtml(formatPrice(car.dailyPrice))} • ${escapeHtml(CAR_UI_STATUS_LABELS[getCarUiStatus(car)] || "Aktivdir")}</span>
          <span>${escapeHtml(formatDate(car.updatedAt || car.createdAt))}</span>
        </article>
      `).join("")
      : '<div class="admin-empty-state">Hələ Supabase üzərindən maşın əlavə olunmayıb.</div>';
  };

  const getCategoryLabel = (category) => CATEGORY_LABELS[String(category || "").toLowerCase()] || "Model";

  const filteredCars = () => state.cars.filter((car) => {
    const haystack = [
      car.title,
      car.brand,
      car.model,
      car.slug,
      car.city,
      car.summary,
      car.description,
    ].join(" ").toLowerCase();
    const uiStatus = getCarUiStatus(car);

    const matchesSearch = !state.filters.search || haystack.includes(state.filters.search);
    const matchesCategory = state.filters.category === "all" || car.category === state.filters.category;
    const matchesStatus = state.filters.status === "all" || uiStatus === state.filters.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderCars = () => {
    if (!refs.carsList || !refs.carsEmpty) return;

    const items = filteredCars();
    refs.carsEmpty.hidden = items.length > 0;

    refs.carsList.innerHTML = items.map((car) => {
      const availabilityState = resolveAvailabilityStatus(car.availabilityStatus);
      const uiStatus = getCarUiStatus(car);
      const availabilityLabel = uiStatus === "archived"
        ? CAR_UI_STATUS_LABELS.archived
        : getAvailabilityLabel(car.availabilityStatus);
      const availabilityBadgeClass = uiStatus === "archived"
        ? getStatusClass("archived")
        : getAvailabilityBadgeClass(car.availabilityStatus);
      return `
      <article class="admin-entity-card">
        <div class="admin-entity-card__identity">
          <div class="admin-entity-card__thumb">
            ${car.coverImageUrl ? `<img src="${escapeHtml(car.coverImageUrl)}" alt="${escapeHtml(car.title)}" />` : '<div class="admin-empty-state">Şəkil yoxdur</div>'}
          </div>
          <div class="admin-entity-card__copy">
            <h3 class="admin-entity-card__title">${escapeHtml(car.title)}</h3>
            <p>${escapeHtml(excerpt(car.summary || car.description || "", 120) || "Qısa təsvir əlavə edin.")}</p>
            <div class="admin-chip-row">
              <span class="admin-chip">${escapeHtml(getCategoryLabel(car.category))}</span>
              <span class="admin-chip">${escapeHtml(formatCityLabel(car.city))}</span>
              ${car.featured ? '<span class="admin-chip">Əsas seçim</span>' : ""}
            </div>
          </div>
        </div>
        <div class="admin-stat-list admin-stat-list--compact">
          <div class="admin-stat-item"><strong>Gündəlik</strong><span>${escapeHtml(formatPrice(car.dailyPrice))}</span></div>
          <div class="admin-stat-item"><strong>Aylıq</strong><span>${escapeHtml(formatPrice(car.monthlyPrice, "Sorğu üzrə"))}</span></div>
          <div class="admin-stat-item"><strong>Oturacaq</strong><span>${escapeHtml(`${car.seats || "-"} nəfər`)}</span></div>
          <div class="admin-stat-item"><strong>Yenilənib</strong><span>${escapeHtml(formatDate(car.updatedAt || car.createdAt))}</span></div>
          <label class="admin-status-control">
            <span>Vəziyyət</span>
            <select class="admin-inline-select admin-inline-select--block" data-car-ui-status-select data-id="${escapeHtml(car.id)}">
              ${Object.entries(CAR_UI_STATUS_LABELS).map(([value, label]) => `<option value="${value}"${uiStatus === value ? " selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="admin-entity-card__actions">
          <div class="admin-entity-card__badges">
            <span class="${availabilityBadgeClass}">${escapeHtml(availabilityLabel)}</span>
          </div>
          <div class="admin-action-row">
            <button class="admin-mini-button" type="button" data-edit-car data-id="${escapeHtml(car.id)}">Redaktə et</button>
            <button class="admin-mini-button admin-mini-button--danger" type="button" data-delete-car data-id="${escapeHtml(car.id)}">Sil</button>
          </div>
        </div>
      </article>
    `;
    }).join("");
  };

  const filteredReservations = () => state.reservations.filter((reservation) => {
    const haystack = [
      reservation.fullName,
      reservation.phone,
      reservation.carSlug,
      reservation.driverLicenseSerial,
      reservation.pickupLocation,
      reservation.note,
    ].join(" ").toLowerCase();

    const matchesSearch = !state.filters.reservationSearch || haystack.includes(state.filters.reservationSearch);
    const matchesStatus = state.filters.reservationStatus === "all" || reservation.status === state.filters.reservationStatus;
    return matchesSearch && matchesStatus;
  });

  const renderReservations = () => {
    if (!refs.reservationsList || !refs.reservationsEmpty) return;

    const items = filteredReservations();
    refs.reservationsEmpty.hidden = items.length > 0;

    refs.reservationsList.innerHTML = items.map((reservation) => {
      const car = state.cars.find((item) => item.slug === reservation.carSlug);
      const carLabel = car ? car.title : reservation.carSlug;
      const whatsappUrl = `https://wa.me/${String(reservation.phone || "").replace(/\D/g, "")}`;
      const telUrl = `tel:${String(reservation.phone || "").replace(/\s+/g, "")}`;

      return `
        <article class="admin-entity-card admin-entity-card--compact">
          <div class="admin-entity-card__copy">
            <h3 class="admin-entity-card__title">${escapeHtml(reservation.fullName || "Adsız rezerv")}</h3>
            <p>${escapeHtml(excerpt(reservation.note || reservation.pickupLocation || "Əlavə qeyd yoxdur.", 130))}</p>
            <div class="admin-chip-row">
              <span class="admin-chip">${escapeHtml(carLabel || "-")}</span>
              <span class="admin-chip">${escapeHtml(reservation.phone || "-")}</span>
              <span class="admin-chip">${escapeHtml(reservation.driverLicenseSerial || "-")}</span>
            </div>
          </div>
          <div class="admin-stat-list admin-stat-list--compact">
            <div class="admin-stat-item"><strong>Götürmə</strong><span>${escapeHtml(`${reservation.pickupDate || "-"} ${reservation.pickupTime || ""}`.trim())}</span></div>
            <div class="admin-stat-item"><strong>Qaytarma</strong><span>${escapeHtml(reservation.dropoffDate || "-")}</span></div>
            <div class="admin-stat-item"><strong>Yer</strong><span>${escapeHtml(reservation.pickupLocation || "-")}</span></div>
            <div class="admin-stat-item"><strong>Göndərilib</strong><span>${escapeHtml(formatDate(reservation.createdAt))}</span></div>
            <label class="admin-status-control">
              <span>Rezerv statusu</span>
              <select class="admin-inline-select admin-inline-select--block" data-reservation-status-select data-id="${escapeHtml(reservation.id)}">
                ${Object.entries(RESERVATION_STATUS_LABELS).map(([value, label]) => `<option value="${value}"${reservation.status === value ? " selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="admin-entity-card__actions">
            <div class="admin-entity-card__badges">
              <span class="${getReservationStatusClass(reservation.status)}">${escapeHtml(RESERVATION_STATUS_LABELS[reservation.status] || reservation.status)}</span>
            </div>
            <div class="admin-action-row">
              <a class="admin-mini-button" href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noreferrer">WhatsApp</a>
              <a class="admin-mini-button" href="${escapeHtml(telUrl)}">Zəng</a>
            </div>
          </div>
        </article>
      `;
    }).join("");
  };

  const renderMediaPicker = () => {
    if (!refs.mediaPicker) return;

    const items = state.media.slice(0, 18);
    refs.mediaPicker.innerHTML = items.length
      ? items.map((media) => `
        <article class="admin-picker-card">
          <div class="admin-picker-card__thumb"><img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.name)}" /></div>
          <div class="admin-picker-card__meta">
            <strong>${escapeHtml(media.name)}</strong>
            <small>${escapeHtml(`${getUsageCount(media.url)} maşında istifadə olunur`)}</small>
          </div>
          <div class="admin-action-row">
            <button class="admin-mini-button" type="button" data-pick-cover data-url="${escapeHtml(media.url)}">Əsas şəkil</button>
            <button class="admin-mini-button" type="button" data-pick-gallery data-url="${escapeHtml(media.url)}">Qalereya</button>
          </div>
        </article>
      `).join("")
      : '<div class="admin-empty-state">Storage bucket-də şəkil tapılmadı.</div>';
  };

  const renderDraftAssets = () => {
    if (!state.draft || !refs.coverPreview || !refs.galleryPreview) return;

    refs.coverPreview.innerHTML = state.draft.coverPreview
      ? `
        <article class="admin-cover-card">
          <img src="${escapeHtml(state.draft.coverPreview)}" alt="Cover preview" />
          <div class="admin-action-row">
            <button class="admin-mini-button admin-mini-button--danger" type="button" data-clear-cover>Sil</button>
          </div>
        </article>
      `
      : '<div class="admin-empty-state">Cover şəkli seçilməyib.</div>';

    refs.galleryPreview.innerHTML = state.draft.galleryItems.length
      ? state.draft.galleryItems.map((item) => `
        <article class="admin-gallery-card">
          <div class="admin-gallery-card__thumb"><img src="${escapeHtml(item.preview || item.url)}" alt="Gallery preview" /></div>
          <div class="admin-action-row">
            <button class="admin-mini-button admin-mini-button--danger" type="button" data-remove-gallery data-key="${escapeHtml(item.key)}">Sil</button>
          </div>
        </article>
      `).join("")
      : '<div class="admin-empty-state">Qalereya şəkli əlavə olunmayıb.</div>';

    renderMediaPicker();
  };

  const resetCarForm = (car) => {
    if (!refs.carForm) return;

    refs.carForm.reset();
    const values = {
      id: car ? car.id : "",
      title: car ? car.title : "",
      slug: car ? car.slug : "",
      brand: car ? car.brand : "",
      model: car ? car.model : "",
      year: car && car.year ? car.year : "",
      category: car ? car.category : "sedan",
      city: car ? formatCityLabel(car.city) : "Bakı",
      color: car ? car.color : "",
      dailyPrice: car && car.dailyPrice !== null ? car.dailyPrice : "",
      monthlyPrice: car && car.monthlyPrice !== null ? car.monthlyPrice : "",
      transmission: car ? car.transmission : "",
      fuelType: car ? car.fuelType : "",
      seats: car && car.seats ? car.seats : "",
      displayStatus: car ? getCarUiStatus(car) : "active",
      summary: car ? car.summary : "",
      description: car ? car.description : "",
      featuresText: car ? car.features.join(", ") : "",
      featured: car ? car.featured : false,
    };

    Object.entries(values).forEach(([name, value]) => {
      const field = refs.carForm.elements.namedItem(name);
      if (!field) return;
      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else {
        field.value = value;
      }
    });

    state.draft = createDraft(car);
    setInlineFeedback("");
    renderDraftAssets();
  };

  const openCarModal = (carId = "") => {
    const car = state.cars.find((item) => item.id === carId) || null;
    resetCarForm(car);
    if (refs.carDialogTitle) refs.carDialogTitle.textContent = car ? `${car.title} məlumatlarını yenilə` : "Yeni maşın əlavə et";
    if (refs.carDialogMode) refs.carDialogMode.textContent = car ? "Redaktə" : "Yeni avtomobil";
    if (refs.carDialog) refs.carDialog.hidden = false;
    document.body.classList.add("is-modal-open");
  };

  const closeCarModal = () => {
    revokeDraftUrls(state.draft);
    state.draft = createDraft(null);
    if (refs.carDialog) refs.carDialog.hidden = true;
    document.body.classList.remove("is-modal-open");
    setInlineFeedback("");
    if (refs.carForm) refs.carForm.reset();
  };

  const readCarFormValues = () => {
    const formData = new FormData(refs.carForm);
    const title = String(formData.get("title") || "").trim();

    return {
      id: String(formData.get("id") || "").trim(),
      title,
      slug: String(formData.get("slug") || slugify(title)).trim(),
      brand: String(formData.get("brand") || "").trim(),
      model: String(formData.get("model") || "").trim(),
      year: String(formData.get("year") || "").trim(),
      category: String(formData.get("category") || "sedan").trim(),
      city: formatCityLabel(String(formData.get("city") || "Bakı").trim()),
      color: String(formData.get("color") || "").trim(),
      dailyPrice: String(formData.get("dailyPrice") || "").trim(),
      monthlyPrice: String(formData.get("monthlyPrice") || "").trim(),
      transmission: String(formData.get("transmission") || "").trim(),
      fuelType: String(formData.get("fuelType") || "").trim(),
      seats: String(formData.get("seats") || "").trim(),
      availabilityStatus: (() => {
        const displayStatus = String(formData.get("displayStatus") || "active").trim();
        if (displayStatus === "rented") return "rented";
        if (displayStatus === "archived") return "unavailable";
        return "available";
      })(),
      status: (() => {
        const displayStatus = String(formData.get("displayStatus") || "active").trim();
        return displayStatus === "archived" ? "archived" : "published";
      })(),
      summary: String(formData.get("summary") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      features: String(formData.get("featuresText") || "")
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
      featured: formData.get("featured") === "on",
    };
  };

  const uploadPendingAssets = async () => {
    let coverUrl = state.draft.coverUrl;
    if (state.draft.coverFile) {
      const uploaded = await Data.uploadImage(state.draft.coverFile);
      coverUrl = uploaded.publicUrl;
    }

    const galleryUrls = [];
    for (const item of state.draft.galleryItems) {
      if (item.file) {
        const uploaded = await Data.uploadImage(item.file);
        galleryUrls.push(uploaded.publicUrl);
      } else {
        galleryUrls.push(item.url);
      }
    }

    return { coverUrl, galleryUrls };
  };

  const saveCar = async (event) => {
    event.preventDefault();
    const values = readCarFormValues();

    if (!values.title || !values.brand || !values.model || !values.dailyPrice || !values.transmission || !values.fuelType || !values.seats) {
      setInlineFeedback("Başlıq, marka, model, gündəlik qiymət, transmissiya, yanacaq və oturacaq məlumatı mütləqdir.", "is-error");
      return;
    }

    const submitButton = qs('button[type="submit"]', refs.carForm);
    const originalLabel = submitButton ? submitButton.textContent : "";

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Saxlanılır...";
      }

      const assets = await uploadPendingAssets();
      const payload = {
        ...values,
        coverImageUrl: assets.coverUrl,
        galleryImages: assets.galleryUrls,
      };

      if (values.id) {
        await Data.updateCar(values.id, payload);
      } else {
        await Data.createCar(payload);
      }

      await loadData();
      notifyPublicSiteChange("cars");
      closeCarModal();
    } catch (error) {
      setInlineFeedback(error.message || "Maşın saxlanmadı.", "is-error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel || "Saxla";
      }
    }
  };

  const renderMedia = () => {
    if (!refs.mediaGrid || !refs.mediaEmpty) return;

    const items = state.media.filter((media) => media.name.toLowerCase().includes(state.filters.mediaSearch));
    refs.mediaEmpty.hidden = items.length > 0;
    refs.mediaGrid.innerHTML = items.map((media) => `
      <article class="admin-media-card">
        <div class="admin-media-card__thumb"><img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.name)}" /></div>
        <div class="admin-media-card__meta">
          <strong>${escapeHtml(media.name)}</strong>
          <small>${escapeHtml(`${getUsageCount(media.url)} maşında istifadə olunur`)}</small>
        </div>
        <div class="admin-action-row">
          <button class="admin-mini-button" type="button" data-copy-media-url data-url="${escapeHtml(media.url)}">Linki kopyala</button>
          <button class="admin-mini-button admin-mini-button--danger" type="button" data-delete-media data-path="${escapeHtml(media.path)}" data-url="${escapeHtml(media.url)}">Sil</button>
        </div>
      </article>
    `).join("");
  };

  const setSettingsFeedback = (message = "", tone = "") => {
    if (!refs.settingsFeedback) return;
    refs.settingsFeedback.textContent = message;
    refs.settingsFeedback.classList.remove("is-success", "is-error");
    if (tone) refs.settingsFeedback.classList.add(tone);
  };

  const populateSettingsForm = () => {
    if (!refs.settingsForm) return;
    const hero = state.homeHero || Data.normalizeHomeHeroContent(Data.DEFAULT_HOME_HERO);
    const content = state.homeSpotlight || Data.normalizeHomeSpotlightContent(Data.DEFAULT_HOME_SPOTLIGHT);
    const cta = state.homeCta || Data.normalizeHomeCtaContent(Data.DEFAULT_HOME_CTA);
    const fieldMap = {
      heroBadge: hero.badge,
      heroTitle: hero.title,
      heroText: hero.text,
      heroPrimaryButtonLabel: hero.primaryButtonLabel,
      heroPrimaryButtonLink: hero.primaryButtonLink,
      heroSecondaryButtonLabel: hero.secondaryButtonLabel,
      heroSecondaryButtonLink: hero.secondaryButtonLink,
      heroTrust1Value: hero.trustItems[0]?.value || "",
      heroTrust1Label: hero.trustItems[0]?.label || "",
      heroTrust2Value: hero.trustItems[1]?.value || "",
      heroTrust2Label: hero.trustItems[1]?.label || "",
      heroTrust3Value: hero.trustItems[2]?.value || "",
      heroTrust3Label: hero.trustItems[2]?.label || "",
      badge: content.badge,
      title: content.title,
      text: content.text,
      imageUrl: content.imageUrl,
      primaryButtonLabel: content.primaryButtonLabel,
      primaryButtonLink: content.primaryButtonLink,
      secondaryButtonLabel: content.secondaryButtonLabel,
      secondaryButtonLink: content.secondaryButtonLink,
      visible: content.visible,
      card1Title: content.cards[0]?.title || "",
      card1Text: content.cards[0]?.text || "",
      card2Title: content.cards[1]?.title || "",
      card2Text: content.cards[1]?.text || "",
      card3Title: content.cards[2]?.title || "",
      card3Text: content.cards[2]?.text || "",
      card4Title: content.cards[3]?.title || "",
      card4Text: content.cards[3]?.text || "",
      ctaBadge: cta.badge,
      ctaTitle: cta.title,
      ctaText: cta.text,
      ctaMeta1: cta.metaItems[0] || "",
      ctaMeta2: cta.metaItems[1] || "",
      ctaMeta3: cta.metaItems[2] || "",
      ctaMeta4: cta.metaItems[3] || "",
      ctaPrimaryButtonLabel: cta.primaryButtonLabel,
      ctaPrimaryButtonLink: cta.primaryButtonLink,
      ctaSecondaryButtonLabel: cta.secondaryButtonLabel,
      ctaSecondaryButtonLink: cta.secondaryButtonLink,
    };

    Object.entries(fieldMap).forEach(([name, value]) => {
      const field = refs.settingsForm.elements.namedItem(name);
      if (!field) return;
      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else {
        field.value = value;
      }
    });
  };

  const renderSettingsImagePreview = () => {
    if (!refs.settingsImagePreview || !refs.settingsForm) return;
    const imageUrlField = refs.settingsForm.elements.namedItem("imageUrl");
    const imageUrl = imageUrlField ? String(imageUrlField.value || "").trim() : "";

    refs.settingsImagePreview.innerHTML = imageUrl
      ? `
        <article class="admin-cover-card">
          <img src="${escapeHtml(imageUrl)}" alt="Homepage section preview" />
          <div class="admin-action-row">
            <button class="admin-mini-button admin-mini-button--danger" type="button" data-clear-settings-image>Sil</button>
          </div>
        </article>
      `
      : '<div class="admin-empty-state">Homepage section üçün şəkil seçilməyib.</div>';
  };

  const renderSettingsMediaPicker = () => {
    if (!refs.settingsMediaPicker) return;
    const items = state.media.slice(0, 12);
    refs.settingsMediaPicker.innerHTML = items.length
      ? items.map((media) => `
        <article class="admin-picker-card">
          <div class="admin-picker-card__thumb"><img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.name)}" /></div>
          <div class="admin-picker-card__meta">
            <strong>${escapeHtml(media.name)}</strong>
            <small>Homepage section şəkli kimi istifadə et</small>
          </div>
          <div class="admin-action-row">
            <button class="admin-mini-button" type="button" data-pick-settings-image data-url="${escapeHtml(media.url)}">Seç</button>
          </div>
        </article>
      `).join("")
      : '<div class="admin-empty-state">Media bölməsində şəkil yoxdur.</div>';
  };

  const readSettingsFormValues = () => {
    const formData = new FormData(refs.settingsForm);
    const existingHero = state.homeHero || Data.normalizeHomeHeroContent(Data.DEFAULT_HOME_HERO);
    const existingSpotlight = state.homeSpotlight || Data.normalizeHomeSpotlightContent(Data.DEFAULT_HOME_SPOTLIGHT);
    const existingCta = state.homeCta || Data.normalizeHomeCtaContent(Data.DEFAULT_HOME_CTA);
    const cards = [1, 2, 3, 4]
      .map((index) => ({
        title: String(formData.get(`card${index}Title`) || "").trim(),
        text: String(formData.get(`card${index}Text`) || "").trim(),
      }))
      .filter((item) => item.title || item.text);
    const heroTrustItems = [1, 2, 3]
      .map((index) => ({
        value: String(formData.get(`heroTrust${index}Value`) || "").trim(),
        label: String(formData.get(`heroTrust${index}Label`) || "").trim(),
      }))
      .filter((item) => item.value || item.label);
    const ctaMetaItems = [1, 2, 3, 4]
      .map((index) => String(formData.get(`ctaMeta${index}`) || "").trim())
      .filter(Boolean);

    return {
      hero: Data.normalizeHomeHeroContent({
        badge: String(formData.get("heroBadge") || "").trim(),
        title: String(formData.get("heroTitle") || "").trim(),
        text: String(formData.get("heroText") || "").trim(),
        primaryButtonLabel: String(formData.get("heroPrimaryButtonLabel") || "").trim(),
        primaryButtonLink: String(formData.get("heroPrimaryButtonLink") || "").trim(),
        secondaryButtonLabel: String(formData.get("heroSecondaryButtonLabel") || "").trim(),
        secondaryButtonLink: String(formData.get("heroSecondaryButtonLink") || "").trim(),
        trustItems: heroTrustItems,
        translations: existingHero.translations,
      }),
      spotlight: Data.normalizeHomeSpotlightContent({
        badge: String(formData.get("badge") || "").trim(),
        title: String(formData.get("title") || "").trim(),
        text: String(formData.get("text") || "").trim(),
        imageUrl: String(formData.get("imageUrl") || "").trim(),
        primaryButtonLabel: String(formData.get("primaryButtonLabel") || "").trim(),
        primaryButtonLink: String(formData.get("primaryButtonLink") || "").trim(),
        secondaryButtonLabel: String(formData.get("secondaryButtonLabel") || "").trim(),
        secondaryButtonLink: String(formData.get("secondaryButtonLink") || "").trim(),
        visible: formData.get("visible") === "on",
        cards,
        translations: existingSpotlight.translations,
      }),
      cta: Data.normalizeHomeCtaContent({
        badge: String(formData.get("ctaBadge") || "").trim(),
        title: String(formData.get("ctaTitle") || "").trim(),
        text: String(formData.get("ctaText") || "").trim(),
        metaItems: ctaMetaItems,
        primaryButtonLabel: String(formData.get("ctaPrimaryButtonLabel") || "").trim(),
        primaryButtonLink: String(formData.get("ctaPrimaryButtonLink") || "").trim(),
        secondaryButtonLabel: String(formData.get("ctaSecondaryButtonLabel") || "").trim(),
        secondaryButtonLink: String(formData.get("ctaSecondaryButtonLink") || "").trim(),
        translations: existingCta.translations,
      }),
    };
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    const submitButton = refs.settingsForm ? qs('button[type="submit"]', refs.settingsForm) : null;
    const originalLabel = submitButton ? submitButton.textContent : "";

    try {
      const payload = readSettingsFormValues();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Saxlanılır...";
      }

      setSettingsFeedback("");
      await Promise.all([
        Data.saveHomeHeroContent(payload.hero),
        Data.saveHomeSpotlightContent(payload.spotlight),
        Data.saveHomeCtaContent(payload.cta),
      ]);
      state.homeHero = payload.hero;
      state.homeSpotlight = payload.spotlight;
      state.homeCta = payload.cta;
      renderSettings();
      notifyPublicSiteChange("settings");
      setSettingsFeedback("Homepage content uğurla saxlanıldı.", "is-success");

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel || "Saxla";
      }
    } catch (error) {
      setSettingsFeedback(error.message || "Homepage content saxlanmadı.", "is-error");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel || "Saxla";
      }
    }
  };

  const renderSettings = () => {
    if (!refs.settingsStatus || !refs.settingsChecklist) return;

    const session = Data.getStoredSession();
    refs.settingsStatus.innerHTML = `
      <div class="admin-preview-item">
        <strong>Supabase URL</strong>
        <p>${escapeHtml(state.config ? state.config.supabaseUrl : "Yüklənmir")}</p>
      </div>
      <div class="admin-preview-item">
        <strong>Storage bucket</strong>
        <p>${escapeHtml(state.config ? state.config.storageBucket : "-")}</p>
      </div>
      <div class="admin-preview-item">
        <strong>Admin istifadəçi</strong>
        <p>${escapeHtml((session && session.user && session.user.email) || "Naməlum")}</p>
      </div>
    `;

    refs.settingsChecklist.innerHTML = `
      <div class="admin-note-item">Cars məlumatı birbaşa Supabase Postgres cədvəlindən oxunur.</div>
      <div class="admin-note-item">Published status-dakı maşınlar public saytda dərhal görünür.</div>
      <div class="admin-note-item">Rezerv formu Supabase reservations cədvəlinə yazılır və sonra WhatsApp-a yönləndirir.</div>
      <div class="admin-note-item">Şəkillər Supabase Storage bucket-də saxlanılır və eyni URL-lərlə public saytda göstərilir.</div>
      <div class="admin-note-item">Homepage hero, spotlight və CTA blokları "site_content" cədvəlində ayrıca row-lardan oxunur.</div>
      <div class="admin-note-item">Bu paneldə localStorage yalnız tema seçimi və auth session üçün istifadə olunur, inventar üçün yox.</div>
    `;

    populateSettingsForm();
    renderSettingsImagePreview();
    renderSettingsMediaPicker();
  };

  const renderAll = () => {
    renderDashboard();
    renderCars();
    renderReservations();
    renderMedia();
    renderSettings();
  };

  const loadData = async () => {
    const [cars, reservations, media, config, homeHero, homeSpotlight, homeCta] = await Promise.all([
      Data.listAdminCars(),
      Data.listAdminReservations().catch(() => []),
      Data.listMedia().catch(() => []),
      Data.getConfig(),
      Data.getHomeHeroContent().catch(() => Data.normalizeHomeHeroContent(Data.DEFAULT_HOME_HERO)),
      Data.getHomeSpotlightContent().catch(() => Data.normalizeHomeSpotlightContent(Data.DEFAULT_HOME_SPOTLIGHT)),
      Data.getHomeCtaContent().catch(() => Data.normalizeHomeCtaContent(Data.DEFAULT_HOME_CTA)),
    ]);

    state.cars = cars;
    state.reservations = reservations;
    state.media = media;
    state.config = config;
    state.homeHero = homeHero;
    state.homeSpotlight = homeSpotlight;
    state.homeCta = homeCta;
    renderAll();

    const carsLegacy = Data.getCarsSchemaMode && Data.getCarsSchemaMode() === "legacy";
    const siteContentFallback = Data.getSiteContentSchemaMode && Data.getSiteContentSchemaMode() === "fallback";

    if (carsLegacy && siteContentFallback) {
      setAppFeedback("Admin panel açıldı, amma Supabase-də `cars` yeni kolonları və `site_content` cədvəli yoxdur. Publish etməzdən əvvəl `supabase/schema.sql` işlədin.", "is-error");
      return;
    }

    if (carsLegacy) {
      setAppFeedback("Admin panel açıldı, amma Supabase cars cədvəlində yeni kolonlar yoxdur. Publish etməzdən əvvəl `supabase/schema.sql` işlədin.", "is-error");
      return;
    }

    if (siteContentFallback) {
      setAppFeedback("Admin panel işləyir, amma `site_content` cədvəli Supabase-də yoxdur. Homepage content hazırda fallback ilə saxlanır. Publish etməzdən əvvəl `supabase/schema.sql` işlədin.", "is-error");
      return;
    }

    setAppFeedback("");
  };

  const bindEvents = () => {
    refs.routeButtons.forEach((button) => {
      button.addEventListener("click", () => showRoute(button.dataset.route));
    });

    window.addEventListener("hashchange", () => {
      showRoute(Auth.sanitizeRoute(window.location.hash.slice(1)), false);
    });

    if (refs.themeButton) {
      refs.themeButton.addEventListener("click", () => {
        setTheme(state.theme === "dark" ? "light" : "dark");
      });
    }

    if (refs.logoutButton) {
      refs.logoutButton.addEventListener("click", () => {
        Auth.logout();
        Auth.redirectToLogin(state.route);
      });
    }

    if (refs.carsSearch) {
      refs.carsSearch.addEventListener("input", (event) => {
        state.filters.search = event.target.value.trim().toLowerCase();
        renderCars();
      });
    }

    if (refs.carsCategory) {
      refs.carsCategory.addEventListener("change", (event) => {
        state.filters.category = event.target.value;
        renderCars();
      });
    }

    if (refs.carsStatus) {
      refs.carsStatus.addEventListener("change", (event) => {
        state.filters.status = event.target.value;
        renderCars();
      });
    }

    if (refs.reservationsSearch) {
      refs.reservationsSearch.addEventListener("input", (event) => {
        state.filters.reservationSearch = event.target.value.trim().toLowerCase();
        renderReservations();
      });
    }

    if (refs.reservationsStatus) {
      refs.reservationsStatus.addEventListener("change", (event) => {
        state.filters.reservationStatus = event.target.value;
        renderReservations();
      });
    }

    if (refs.mediaSearch) {
      refs.mediaSearch.addEventListener("input", (event) => {
        state.filters.mediaSearch = event.target.value.trim().toLowerCase();
        renderMedia();
      });
    }

    if (refs.mediaInput) {
      refs.mediaInput.addEventListener("change", async () => {
        const files = [...(refs.mediaInput.files || [])];
        refs.mediaInput.value = "";
        if (!files.length) return;

        try {
          for (const file of files) {
            await Data.uploadImage(file);
          }
          await loadData();
        } catch (error) {
          alert(error.message || "Şəkil yüklənmədi.");
        }
      });
    }

    if (refs.settingsForm) {
      refs.settingsForm.addEventListener("submit", saveSettings);

      const imageUrlField = refs.settingsForm.elements.namedItem("imageUrl");
      if (imageUrlField) {
        imageUrlField.addEventListener("input", () => {
          renderSettingsImagePreview();
        });
      }
    }

    qsa("[data-open-car-modal]").forEach((button) => {
      button.addEventListener("click", () => openCarModal());
    });

    qsa("[data-close-dialog]").forEach((button) => {
      button.addEventListener("click", () => closeCarModal());
    });

    if (refs.coverInput) {
      refs.coverInput.addEventListener("change", () => {
        const file = refs.coverInput.files && refs.coverInput.files[0];
        if (!file || !state.draft) return;
        if (state.draft.coverFile && state.draft.coverPreview && state.draft.coverPreview.startsWith("blob:")) {
          URL.revokeObjectURL(state.draft.coverPreview);
        }
        state.draft.coverFile = file;
        state.draft.coverPreview = createPreviewUrl(file);
        renderDraftAssets();
      });
    }

    if (refs.galleryInput) {
      refs.galleryInput.addEventListener("change", () => {
        const files = [...(refs.galleryInput.files || [])];
        refs.galleryInput.value = "";
        if (!files.length || !state.draft) return;
        files.forEach((file) => {
          state.draft.galleryItems.push({
            key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url: "",
            file,
            preview: createPreviewUrl(file),
          });
        });
        renderDraftAssets();
      });
    }

    if (refs.carForm) {
      refs.carForm.addEventListener("submit", saveCar);
    }

    document.addEventListener("change", async (event) => {
      const uiStatusSelect = event.target.closest("[data-car-ui-status-select]");
      if (uiStatusSelect) {
        const car = state.cars.find((item) => item.id === uiStatusSelect.dataset.id);
        if (!car) return;

        try {
          const uiStatus = uiStatusSelect.value;
          await Data.updateCar(car.id, {
            ...car,
            availabilityStatus: uiStatus === "rented" ? "rented" : (uiStatus === "archived" ? "unavailable" : "available"),
            status: uiStatus === "archived" ? "archived" : "published",
            coverImageUrl: car.coverImageUrl,
            galleryImages: car.galleryImages,
            dailyPrice: car.dailyPrice,
            monthlyPrice: car.monthlyPrice,
            fuelType: car.fuelType,
            sortOrder: car.sortOrder,
          });
          await loadData();
          notifyPublicSiteChange("cars");
        } catch (error) {
          alert(error.message || "Maşın vəziyyəti yenilənmədi.");
        }
        return;
      }

      const reservationStatusSelect = event.target.closest("[data-reservation-status-select]");
      if (reservationStatusSelect) {
        const reservation = state.reservations.find((item) => item.id === reservationStatusSelect.dataset.id);
        if (!reservation) return;

        try {
          await Data.updateReservationLead(reservation.id, {
            status: reservationStatusSelect.value,
          });
          await loadData();
        } catch (error) {
          alert(error.message || "Rezerv statusu yenilənmədi.");
        }
      }
    });

    document.addEventListener("click", async (event) => {
      const editButton = event.target.closest("[data-edit-car]");
      if (editButton) {
        openCarModal(editButton.dataset.id);
        return;
      }

      const deleteButton = event.target.closest("[data-delete-car]");
      if (deleteButton) {
        const car = state.cars.find((item) => item.id === deleteButton.dataset.id);
        if (!car) return;
        if (!window.confirm(`${car.title} silinsin?`)) return;
        try {
          await Data.deleteCar(car.id, car.slug);
          await loadData();
          notifyPublicSiteChange("cars");
        } catch (error) {
          alert(error.message || "Maşın silinmədi.");
        }
        return;
      }

      const clearCover = event.target.closest("[data-clear-cover]");
      if (clearCover && state.draft) {
        if (state.draft.coverFile && state.draft.coverPreview && state.draft.coverPreview.startsWith("blob:")) {
          URL.revokeObjectURL(state.draft.coverPreview);
        }
        state.draft.coverFile = null;
        state.draft.coverUrl = "";
        state.draft.coverPreview = "";
        renderDraftAssets();
        return;
      }

      const removeGallery = event.target.closest("[data-remove-gallery]");
      if (removeGallery && state.draft) {
        const index = state.draft.galleryItems.findIndex((item) => item.key === removeGallery.dataset.key);
        if (index >= 0) {
          const [removed] = state.draft.galleryItems.splice(index, 1);
          if (removed.file && removed.preview && removed.preview.startsWith("blob:")) {
            URL.revokeObjectURL(removed.preview);
          }
        }
        renderDraftAssets();
        return;
      }

      const pickCover = event.target.closest("[data-pick-cover]");
      if (pickCover && state.draft) {
        state.draft.coverUrl = pickCover.dataset.url || "";
        state.draft.coverFile = null;
        state.draft.coverPreview = state.draft.coverUrl;
        renderDraftAssets();
        return;
      }

      const pickGallery = event.target.closest("[data-pick-gallery]");
      if (pickGallery && state.draft) {
        const url = pickGallery.dataset.url || "";
        const exists = state.draft.galleryItems.some((item) => item.url === url && !item.file);
        if (!exists) {
          state.draft.galleryItems.push({
            key: `picked-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            url,
            file: null,
            preview: url,
          });
        }
        renderDraftAssets();
        return;
      }

      const deleteMedia = event.target.closest("[data-delete-media]");
      if (deleteMedia) {
        const url = deleteMedia.dataset.url || "";
        const usage = getUsageCount(url);
        if (usage > 0) {
          alert("Bu şəkil ən azı bir maşında istifadə olunur. Əvvəlcə həmin bağlantını maşından silin.");
          return;
        }
        if (!window.confirm("Şəkil storage bucket-dən silinsin?")) return;
        try {
          await Data.deleteMedia(deleteMedia.dataset.path || "");
          await loadData();
        } catch (error) {
          alert(error.message || "Şəkil silinmədi.");
        }
        return;
      }

      const copyMedia = event.target.closest("[data-copy-media-url]");
      if (copyMedia) {
        try {
          await navigator.clipboard.writeText(copyMedia.dataset.url || "");
        } catch {
          alert("Link kopyalanmadı.");
        }
        return;
      }

      const pickSettingsImage = event.target.closest("[data-pick-settings-image]");
      if (pickSettingsImage && refs.settingsForm) {
        const field = refs.settingsForm.elements.namedItem("imageUrl");
        if (field) {
          field.value = pickSettingsImage.dataset.url || "";
          renderSettingsImagePreview();
        }
        return;
      }

      const clearSettingsImage = event.target.closest("[data-clear-settings-image]");
      if (clearSettingsImage && refs.settingsForm) {
        const field = refs.settingsForm.elements.namedItem("imageUrl");
        if (field) {
          field.value = "";
          renderSettingsImagePreview();
        }
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCarModal();
      }
    });
  };

  const init = async () => {
    collectRefs();
    setTheme(state.theme);
    bindEvents();
    showRoute(state.route, false);

    try {
      await Auth.ensureAuthenticated();
    } catch (error) {
      try {
        sessionStorage.setItem(LAST_ERROR_KEY, error.message || "Admin girişində xəta baş verdi.");
      } catch {
        // ignore sessionStorage issues
      }
      Auth.logout();
      Auth.redirectToLogin(state.route);
      return;
    }

    try {
      await loadData();
    } catch (error) {
      setAppFeedback(error.message || "Admin məlumatları yüklənmədi.", "is-error");
    }
  };

  document.addEventListener("DOMContentLoaded", init);
})();
