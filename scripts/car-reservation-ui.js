(function () {
  const Data = window.RentacarData;
  if (!Data) return;

  const BAKU_LOCALE = "az-AZ";

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[match]));

  const ensureStyles = () => {
    if (document.getElementById("reservation-summary-styles")) return;
    const style = document.createElement("style");
    style.id = "reservation-summary-styles";
    style.textContent = `
      .fleet-card__schedule { display: none !important; }
      .reservation-summary-block,
      .vehicle-rental-state {
        display: grid;
        gap: 5px;
        margin-top: 10px;
        padding: 11px 12px;
        border-radius: 16px;
        border: 1px solid rgba(255, 107, 60, 0.16);
        background: linear-gradient(180deg, rgba(255, 248, 242, 0.96), rgba(255, 241, 234, 0.92));
        box-shadow: 0 12px 24px rgba(76, 52, 30, 0.08);
      }
      .reservation-summary-block__title,
      .vehicle-rental-state__title {
        margin: 0;
        color: var(--accent);
        font-family: "Outfit", sans-serif;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .reservation-summary-block__item,
      .vehicle-rental-state__item {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px;
        align-items: baseline;
        color: var(--muted);
        font-size: 0.84rem;
        line-height: 1.45;
      }
      .reservation-summary-block__item span:first-child,
      .vehicle-rental-state__item span:first-child {
        color: var(--text);
        font-weight: 700;
      }
      .reservation-summary-block__item strong,
      .vehicle-rental-state__item strong {
        color: var(--text);
        font-weight: 700;
      }
      .vehicle-summary .vehicle-rental-state {
        max-width: 380px;
      }
      body[data-theme="dark"] .reservation-summary-block,
      body[data-theme="dark"] .vehicle-rental-state {
        border-color: rgba(255, 110, 64, 0.18);
        background: linear-gradient(180deg, rgba(36, 27, 31, 0.96), rgba(28, 21, 25, 0.94));
        box-shadow: 0 16px 28px rgba(0, 0, 0, 0.24);
      }
      body[data-theme="dark"] .reservation-summary-block__item,
      body[data-theme="dark"] .vehicle-rental-state__item {
        color: #d9c7bb;
      }
      body[data-theme="dark"] .reservation-summary-block__item span:first-child,
      body[data-theme="dark"] .reservation-summary-block__item strong,
      body[data-theme="dark"] .vehicle-rental-state__item span:first-child,
      body[data-theme="dark"] .vehicle-rental-state__item strong {
        color: #fff4ec;
      }
    `;
    document.head.appendChild(style);
  };

  const parseSlugFromHref = (href) => {
    try {
      const url = new URL(href, window.location.origin);
      const parts = url.pathname.split("/").filter(Boolean);
      return decodeURIComponent(parts[parts.length - 1] || "").replace(/\.html$/i, "");
    } catch {
      return "";
    }
  };

  const formatDateTime = (value) => (
    typeof Data.formatSimpleReservationDateTime === "function"
      ? Data.formatSimpleReservationDateTime(value, BAKU_LOCALE)
      : String(value || "")
  );

  const getActiveReservationData = (car) => {
    if (!car || !car.isReserved) return null;
    const endMs = new Date(car.reservationEndDateTime || "").getTime();
    if (!Number.isFinite(endMs) || endMs <= Date.now()) return null;
    const startText = formatDateTime(car.reservationStartDateTime);
    const endText = formatDateTime(car.reservationEndDateTime);
    if (!startText || !endText) return null;
    return {
      startText,
      endText,
    };
  };

  const renderCardBlock = (cardMeta, car) => {
    if (!cardMeta) return;
    let block = qs("[data-reservation-summary-block]", cardMeta);
    const data = getActiveReservationData(car);

    if (!data) {
      if (block) block.remove();
      return;
    }

    if (!block) {
      block = document.createElement("div");
      block.className = "reservation-summary-block";
      block.setAttribute("data-reservation-summary-block", "");
    }

    block.innerHTML = `
      <div class="reservation-summary-block__title">Rezerv olunub</div>
      <div class="reservation-summary-block__item"><span>Götürülmə:</span><strong>${escapeHtml(data.startText)}</strong></div>
      <div class="reservation-summary-block__item"><span>Qayıdış:</span><strong>${escapeHtml(data.endText)}</strong></div>
    `;

    const title = qs("strong", cardMeta);
    if (title) title.insertAdjacentElement("afterend", block);
    else cardMeta.prepend(block);
  };

  const renderDetailBlock = (car) => {
    const summary = qs(".vehicle-summary");
    if (!summary) return;

    let block = qs("[data-car-rental-state]", summary);
    if (!block) {
      block = document.createElement("div");
      block.className = "vehicle-rental-state";
      block.setAttribute("data-car-rental-state", "");
      block.hidden = true;
    }

    const title = qs("h1", summary);
    if (title && block.previousElementSibling !== title) {
      title.insertAdjacentElement("afterend", block);
    } else if (!block.parentElement) {
      summary.appendChild(block);
    }

    const data = getActiveReservationData(car);
    if (!data) {
      block.hidden = true;
      block.innerHTML = "";
      return;
    }

    block.hidden = false;
    block.innerHTML = `
      <div class="vehicle-rental-state__title">Rezerv olunub</div>
      <div class="vehicle-rental-state__item"><span>Götürülmə:</span><strong>${escapeHtml(data.startText)}</strong></div>
      <div class="vehicle-rental-state__item"><span>Qayıdış:</span><strong>${escapeHtml(data.endText)}</strong></div>
    `;
  };

  const renderPublicReservationState = async () => {
    ensureStyles();

    let cars = [];
    try {
      cars = await Data.listPublishedCars();
    } catch {
      cars = [];
    }

    const carsBySlug = new Map(cars.map((car) => [String(car.slug || ""), car]));

    qsa(".vehicle-card-link").forEach((link) => {
      const slug = parseSlugFromHref(link.getAttribute("href") || "");
      const car = carsBySlug.get(slug);
      const meta = qs(".fleet-card__meta", link) || qs(".fleet-card__meta", link.parentElement || link);
      renderCardBlock(meta, car);
    });

    if (document.body.dataset.page === "car") {
      const slug = parseSlugFromHref(window.location.pathname);
      const currentCar = carsBySlug.get(slug) || await Data.getPublishedCarBySlug(slug).catch(() => null);
      renderDetailBlock(currentCar);
    }
  };

  let renderTimer = null;
  const queueRender = () => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => {
      renderPublicReservationState();
    }, 80);
  };

  const initObservers = () => {
    const observer = new MutationObserver(() => queueRender());
    const fleetGrid = qs(".fleet-grid--catalog");
    const vehicleSummary = qs(".vehicle-summary");
    if (fleetGrid) observer.observe(fleetGrid, { childList: true, subtree: true });
    if (vehicleSummary) observer.observe(vehicleSummary, { childList: true, subtree: true });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") queueRender();
    });
    window.addEventListener("pageshow", queueRender);
    window.addEventListener("focus", queueRender);
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderPublicReservationState();
    window.setTimeout(renderPublicReservationState, 500);
    window.setTimeout(renderPublicReservationState, 1400);
    initObservers();
  });
})();
