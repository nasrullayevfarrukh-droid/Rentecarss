(function () {
  const Data = window.RentacarData;
  if (!Data) return;

  const STYLE_ID = "simple-reservation-ui-style";
  const BLOCK_ATTR = "data-simple-reservation-block";
  let renderQueued = false;

  const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .fleet-card__schedule {
        display: none !important;
      }
      .simple-reservation {
        display: grid;
        gap: 4px;
        margin-top: 10px;
        padding: 10px 12px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: linear-gradient(180deg, rgba(21, 28, 39, 0.92), rgba(28, 37, 50, 0.82));
        box-shadow: 0 18px 40px rgba(7, 10, 15, 0.18);
      }
      .simple-reservation strong {
        color: #fff7f2;
        font-size: 0.92rem;
        line-height: 1.2;
      }
      .simple-reservation span {
        color: rgba(255, 247, 242, 0.82);
        font-size: 0.82rem;
        line-height: 1.35;
      }
      .simple-reservation--card {
        margin-bottom: 10px;
      }
      .simple-reservation--detail {
        margin: 14px 0 10px;
        max-width: 420px;
      }
      body[data-theme="light"] .simple-reservation {
        border-color: rgba(255, 100, 54, 0.14);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 243, 237, 0.92));
        box-shadow: 0 18px 34px rgba(255, 100, 54, 0.12);
      }
      body[data-theme="light"] .simple-reservation strong {
        color: #1d1820;
      }
      body[data-theme="light"] .simple-reservation span {
        color: rgba(39, 30, 31, 0.76);
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

  const extractSlugFromHref = (href) => {
    try {
      const url = new URL(href, window.location.origin);
      const match = url.pathname.match(/\/cars\/([^/?#]+)/i);
      if (match && match[1]) return decodeURIComponent(match[1]);
      const querySlug = url.searchParams.get("slug");
      return querySlug ? decodeURIComponent(querySlug) : "";
    } catch {
      return "";
    }
  };

  const shouldShowReservation = (car) => {
    if (!car) return false;
    if (typeof Data.isSimpleReservationActive === "function") {
      return Data.isSimpleReservationActive(car);
    }
    return Boolean(car.isReserved && car.reservationEndDateTime);
  };

  const buildBlockMarkup = (car) => {
    const startLabel = Data.formatSimpleReservationDateTime(car.reservationStartDateTime, "az-AZ", "Asia/Baku");
    const endLabel = Data.formatSimpleReservationDateTime(car.reservationEndDateTime, "az-AZ", "Asia/Baku");
    return `
      <strong>Rezerv olunub</strong>
      <span>Götürülmə: ${startLabel || "-"}</span>
      <span>Qayıdış: ${endLabel || "-"}</span>
    `;
  };

  const upsertCardReservationBlocks = async () => {
    const cardsRoot = document.querySelectorAll(".fleet-grid--catalog");
    if (!cardsRoot.length) return;

    const cars = await Data.listPublishedCars().catch(() => []);
    const carsBySlug = new Map(cars.map((car) => [toStringValue(car.slug), car]));

    document.querySelectorAll('.fleet-grid--catalog a[href*="/cars/"], .fleet-grid--catalog a[href*="car.html"]').forEach((link) => {
      const slug = extractSlugFromHref(link.getAttribute("href") || "");
      const car = carsBySlug.get(slug);
      const card = link.closest("article") || link;
      const existing = card.querySelector(`[${BLOCK_ATTR}="card"]`);

      if (!shouldShowReservation(car)) {
        if (existing) existing.remove();
        return;
      }

      const heading = card.querySelector("h3, h4, strong");
      if (!heading) return;

      const block = existing || document.createElement("div");
      block.setAttribute(BLOCK_ATTR, "card");
      block.className = "simple-reservation simple-reservation--card";
      block.innerHTML = buildBlockMarkup(car);

      if (!existing) {
        heading.insertAdjacentElement("afterend", block);
      }
    });
  };

  const upsertDetailReservationBlock = async () => {
    if (document.body.dataset.page !== "car") return;
    const summary = document.querySelector(".vehicle-summary");
    const heading = summary && summary.querySelector("h1");
    if (!summary || !heading) return;

    const slug = extractSlugFromHref(window.location.pathname);
    const car = slug ? await Data.getPublishedCarBySlug(slug).catch(() => null) : null;
    const existing = summary.querySelector(`[${BLOCK_ATTR}="detail"]`);

    if (!shouldShowReservation(car)) {
      if (existing) existing.remove();
      return;
    }

    const block = existing || document.createElement("div");
    block.setAttribute(BLOCK_ATTR, "detail");
    block.className = "simple-reservation simple-reservation--detail";
    block.innerHTML = buildBlockMarkup(car);

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
    window.setTimeout(queueRender, 400);
    window.setTimeout(queueRender, 1200);
    observeMutations();
  });
})();