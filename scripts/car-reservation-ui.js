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
        display: inline-grid;
        gap: 2px;
        justify-items: start;
        width: fit-content;
        max-width: 100%;
        margin-top: 8px;
        padding: 6px 10px;
        border: 1px solid rgba(255, 107, 44, 0.22);
        border-radius: 14px;
        background: rgba(39, 30, 33, 0.92);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
      }
      .simple-reservation__title {
        color: #ff9b67;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .simple-reservation__row,
      .simple-reservation__note {
        color: rgba(255, 244, 237, 0.86);
        font-size: 0.74rem;
        line-height: 1.3;
      }
      .simple-reservation__row b {
        color: rgba(255, 244, 237, 0.62);
        font-weight: 700;
      }
      .simple-reservation__note {
        color: rgba(255, 244, 237, 0.62);
      }
      .simple-reservation--card {
        max-width: 260px;
        margin-bottom: 2px;
      }
      .simple-reservation--detail {
        gap: 3px;
        max-width: 360px;
        margin-top: 10px;
        margin-bottom: 6px;
        padding: 8px 12px;
        border-radius: 16px;
      }
      .simple-reservation--detail .simple-reservation__title {
        font-size: 0.74rem;
      }
      .simple-reservation--detail .simple-reservation__row,
      .simple-reservation--detail .simple-reservation__note {
        font-size: 0.78rem;
      }
      body[data-theme="light"] .simple-reservation {
        border-color: rgba(255, 107, 44, 0.28);
        background: rgba(255, 250, 246, 0.96);
      }
      body[data-theme="light"] .simple-reservation__title {
        color: #cf5a24;
      }
      body[data-theme="light"] .simple-reservation__row {
        color: rgba(50, 36, 37, 0.84);
      }
      body[data-theme="light"] .simple-reservation__row b {
        color: rgba(50, 36, 37, 0.62);
      }
      body[data-theme="light"] .simple-reservation__note {
        color: rgba(50, 36, 37, 0.62);
      }
      @media (max-width: 720px) {
        .simple-reservation {
          margin-top: 7px;
          padding: 6px 9px;
          border-radius: 12px;
        }
        .simple-reservation__title {
          font-size: 0.68rem;
        }
        .simple-reservation__row,
        .simple-reservation__note {
          font-size: 0.71rem;
        }
        .simple-reservation--card,
        .simple-reservation--detail {
          max-width: 100%;
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
      ? Data.formatSimpleReservationDateTime(car.reservationStartDateTime)
      : "";
    const endLabel = typeof Data.formatSimpleReservationDateTime === "function"
      ? Data.formatSimpleReservationDateTime(car.reservationEndDateTime)
      : "";
    const note = toStringValue(car.reservationNote);

    if (!startLabel && !endLabel && !note) return null;

    return {
      startLabel,
      endLabel,
      note,
    };
  };

  const formatDetailLabel = (value) => {
    const clean = toStringValue(value);
    if (!clean) return "-";
    const parts = clean.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]} saat ${parts.slice(1).join(" ")}`;
    }
    return clean;
  };

  const buildBlockMarkup = (view, variant = "card") => {
    const startLabel = variant === "detail" ? formatDetailLabel(view.startLabel) : (view.startLabel || "-");
    const endLabel = variant === "detail" ? formatDetailLabel(view.endLabel) : (view.endLabel || "-");

    return `
      <strong class="simple-reservation__title">Rezerv olunub</strong>
      <span class="simple-reservation__row"><b>Verilmə:</b> ${escapeHtml(startLabel)}</span>
      <span class="simple-reservation__row"><b>Qaytarılma:</b> ${escapeHtml(endLabel)}</span>
      ${view.note ? `<span class="simple-reservation__note">${escapeHtml(view.note)}</span>` : ""}
    `;
  };

  const clearLegacyReservationUi = (scope = document) => {
    qsa(".fleet-card__schedule, .vehicle-rental-state", scope).forEach((node) => {
      node.innerHTML = "";
      node.hidden = true;
    });
  };

  const loadCarBySlug = async (slug, cache) => {
    const cleanSlug = toStringValue(slug);
    if (!cleanSlug) return null;
    if (cache.has(cleanSlug)) return cache.get(cleanSlug);
    const promise = Data.getPublishedCarBySlug(cleanSlug).catch(() => null);
    cache.set(cleanSlug, promise);
    return promise;
  };

  const insertAfterTarget = (target, block) => {
    if (!target) return;
    target.insertAdjacentElement("afterend", block);
  };

  const upsertCardReservationBlocks = async () => {
    const links = qsa('.fleet-grid--catalog a[href*="/cars/"], .fleet-grid--catalog a[href*="car.html"]');
    if (!links.length) return;

    const cache = new Map();
    await Promise.all(links.map(async (link) => {
      const slug = extractSlugFromLocation(link.getAttribute("href") || "");
      const car = await loadCarBySlug(slug, cache);
      const card = link.closest("article") || link;
      const heading = qs(".fleet-card__meta strong, .fleet-card__meta h3, h3, h4", card);
      const price = qs(".fleet-card__meta span", card);
      const existing = qs(`[${BLOCK_ATTR}="card"]`, card);
      const view = getReservationView(car);
      const anchor = price || heading;

      clearLegacyReservationUi(card);

      if (!view || !anchor) {
        if (existing) existing.remove();
        return;
      }

      const block = existing || document.createElement("div");
      block.setAttribute(BLOCK_ATTR, "card");
      block.className = "simple-reservation simple-reservation--card";
      block.innerHTML = buildBlockMarkup(view, "card");

      if (!existing) {
        insertAfterTarget(anchor, block);
      } else if (block.previousElementSibling !== anchor) {
        block.remove();
        insertAfterTarget(anchor, block);
      }
    }));
  };

  const upsertDetailReservationBlock = async () => {
    if (document.body.dataset.page !== "car") return;

    const summary = qs(".vehicle-summary");
    const heading = summary && qs("h1", summary);
    const price = summary && qs(".vehicle-price", summary);
    if (!summary || !heading) return;

    clearLegacyReservationUi(summary);

    const slug = extractSlugFromLocation(window.location.href);
    const car = await Data.getPublishedCarBySlug(slug).catch(() => null);
    const existing = qs(`[${BLOCK_ATTR}="detail"]`, summary);
    const view = getReservationView(car);
    const anchor = price || heading;

    if (!view || !anchor) {
      if (existing) existing.remove();
      return;
    }

    const block = existing || document.createElement("div");
    block.setAttribute(BLOCK_ATTR, "detail");
    block.className = "simple-reservation simple-reservation--detail";
    block.innerHTML = buildBlockMarkup(view, "detail");

    if (!existing) {
      insertAfterTarget(anchor, block);
    } else if (block.previousElementSibling !== anchor) {
      block.remove();
      insertAfterTarget(anchor, block);
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