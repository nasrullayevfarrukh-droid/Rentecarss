(function () {
  const Data = window.RentacarData;
  if (!Data) return;

  const STYLE_ID = "simple-reservation-ui-style";
  const BLOCK_ATTR = "data-simple-reservation-block";
  let renderQueued = false;

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[match]));

  const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .fleet-card__schedule,
      .vehicle-rental-state {
        display: none !important;
      }
      .simple-reservation {
        display: grid;
        gap: 4px;
        margin-top: 10px;
        padding: 10px 12px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: linear-gradient(180deg, rgba(18, 21, 27, 0.92), rgba(30, 35, 42, 0.82));
        box-shadow: 0 16px 32px rgba(10, 12, 18, 0.18);
      }
      .simple-reservation__title {
        color: #fff7f2;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .simple-reservation__row,
      .simple-reservation__note {
        color: rgba(255, 247, 242, 0.9);
        font-size: 0.82rem;
        line-height: 1.4;
      }
      .simple-reservation__row b {
        color: #ffffff;
        font-weight: 700;
      }
      .simple-reservation__note {
        color: rgba(255, 247, 242, 0.74);
      }
      .simple-reservation--card {
        margin-bottom: 10px;
      }
      .simple-reservation--detail {
        max-width: 360px;
        margin-bottom: 12px;
      }
      body[data-theme="light"] .simple-reservation {
        border-color: rgba(255, 100, 54, 0.14);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 243, 237, 0.94));
        box-shadow: 0 16px 30px rgba(255, 100, 54, 0.12);
      }
      body[data-theme="light"] .simple-reservation__title {
        color: #1f181a;
      }
      body[data-theme="light"] .simple-reservation__row {
        color: rgba(31, 24, 26, 0.86);
      }
      body[data-theme="light"] .simple-reservation__row b {
        color: #1a1517;
      }
      body[data-theme="light"] .simple-reservation__note {
        color: rgba(31, 24, 26, 0.66);
      }
      @media (max-width: 720px) {
        .simple-reservation {
          margin-top: 8px;
          padding: 9px 10px;
          border-radius: 14px;
        }
        .simple-reservation--detail {
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const toStringValue = (value) => String(value ?? "").trim();

  const extractSlugFromLocation = (value) => {
    try {
      const url = new URL(value || window.location.href, window.location.origin);
      const match = url.pathname.match(/\/cars\/([^/?#]+)/i);
      if (match && match[1]) return decodeURIComponent(match[1]);
      const querySlug = url.searchParams.get("slug");
      return querySlug ? decodeURIComponent(querySlug) : "";
    } catch {
      return "";
    }
  };

  const getReservationView = (car) => {
    if (!car || typeof Data.isSimpleReservationActive !== "function") return null;
    if (!Data.isSimpleReservationActive(car)) return null;

    const startLabel = typeof Data.formatSimpleReservationDateTime === "function"
      ? Data.formatSimpleReservationDateTime(car.reservationStartDateTime, "az-AZ", "Asia/Baku")
      : "";
    const endLabel = typeof Data.formatSimpleReservationDateTime === "function"
      ? Data.formatSimpleReservationDateTime(car.reservationEndDateTime, "az-AZ", "Asia/Baku")
      : "";
    const note = toStringValue(car.reservationNote);

    return {
      startLabel,
      endLabel,
      note,
    };
  };

  const buildBlockMarkup = (view) => `
    <strong class="simple-reservation__title">Rezerv olunub</strong>
    <span class="simple-reservation__row"><b>Götürülmə:</b> ${escapeHtml(view.startLabel || "-")}</span>
    <span class="simple-reservation__row"><b>Qayıdış:</b> ${escapeHtml(view.endLabel || "-")}</span>
    ${view.note ? `<span class="simple-reservation__note">${escapeHtml(view.note)}</span>` : ""}
  `;

  const clearLegacyReservationUi = (scope = document) => {
    qsa(".fleet-card__schedule, .vehicle-rental-state", scope).forEach((node) => {
      node.innerHTML = "";
      node.hidden = true;
    });
  };

  const upsertCardReservationBlocks = async () => {
    const grids = qsa(".fleet-grid--catalog");
    if (!grids.length) return;

    const cars = await Data.listPublishedCars().catch(() => []);
    const carsBySlug = new Map(cars.map((car) => [toStringValue(car.slug), car]));

    qsa('.fleet-grid--catalog a[href*="/cars/"], .fleet-grid--catalog a[href*="car.html"]').forEach((link) => {
      const slug = extractSlugFromLocation(link.getAttribute("href") || "");
      const car = carsBySlug.get(slug);
      const card = link.closest("article") || link;
      const heading = qs(".fleet-card__meta strong, .fleet-card__meta h3, h3, h4", card);
      const existing = qs(`[${BLOCK_ATTR}="card"]`, card);
      const view = getReservationView(car);

      clearLegacyReservationUi(card);

      if (!view || !heading) {
        if (existing) existing.remove();
        return;
      }

      const block = existing || document.createElement("div");
      block.setAttribute(BLOCK_ATTR, "card");
      block.className = "simple-reservation simple-reservation--card";
      block.innerHTML = buildBlockMarkup(view);

      if (!existing) {
        heading.insertAdjacentElement("afterend", block);
      }
    });
  };

  const upsertDetailReservationBlock = async () => {
    if (document.body.dataset.page !== "car") return;

    const summary = qs(".vehicle-summary");
    const heading = summary && qs("h1", summary);
    if (!summary || !heading) return;

    clearLegacyReservationUi(summary);

    const slug = extractSlugFromLocation(window.location.href);
    const car = slug ? await Data.getPublishedCarBySlug(slug).catch(() => null) : null;
    const existing = qs(`[${BLOCK_ATTR}="detail"]`, summary);
    const view = getReservationView(car);

    if (!view) {
      if (existing) existing.remove();
      return;
    }

    const block = existing || document.createElement("div");
    block.setAttribute(BLOCK_ATTR, "detail");
    block.className = "simple-reservation simple-reservation--detail";
    block.innerHTML = buildBlockMarkup(view);

    if (!existing) {
      heading.insertAdjacentElement("afterend", block);
    }
  };

  const renderReservationUi = async () => {
    renderQueued = false;
    injectStyles();
    await upsertCardReservationBlocks();
    await upsertDetailReservationBlock();
  };

  const queueRender = () => {
    if (renderQueued) return;
    renderQueued = true;
    window.requestAnimationFrame(() => {
      renderReservationUi();
    });
  };

  const observeMutations = () => {
    const observer = new MutationObserver(() => {
      queueRender();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    queueRender();
    window.setTimeout(queueRender, 350);
    window.setTimeout(queueRender, 900);
    window.setTimeout(queueRender, 1600);
    window.addEventListener("pageshow", queueRender);
    observeMutations();
  });
})();