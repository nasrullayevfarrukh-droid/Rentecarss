(function () {
  const Data = window.RentacarData;
  if (!Data) return;

  const STYLE_ID = "admin-simple-reservation-style";
  const SECTION_ID = "admin-simple-reservation-section";

  const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .admin-simple-reservation {
        margin-top: 18px;
        padding: 20px;
        border-radius: 24px;
        border: 1px solid rgba(255, 100, 54, 0.12);
        background: rgba(25, 20, 24, 0.72);
      }
      .admin-simple-reservation__head {
        margin-bottom: 16px;
      }
      .admin-simple-reservation__head strong {
        display: block;
        margin-bottom: 4px;
        color: #fff3ed;
        font-size: 1rem;
      }
      .admin-simple-reservation__head span {
        color: rgba(255, 243, 237, 0.72);
        font-size: 0.88rem;
      }
      .admin-simple-reservation__fields[hidden] {
        display: none !important;
      }
      body[data-admin-theme="light"] .admin-simple-reservation {
        background: rgba(255, 250, 247, 0.92);
      }
      body[data-admin-theme="light"] .admin-simple-reservation__head strong {
        color: #18111a;
      }
      body[data-admin-theme="light"] .admin-simple-reservation__head span {
        color: rgba(24, 17, 26, 0.68);
      }
    `;
    document.head.appendChild(style);
  };

  const toLocalDateTimeValue = (value) => {
    const clean = String(value ?? "").trim();
    if (!clean) return "";

    const normalized = clean.replace(" ", "T");
    const directMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (directMatch) {
      return `${directMatch[1]}-${directMatch[2]}-${directMatch[3]}T${directMatch[4]}:${directMatch[5]}`;
    }

    const date = new Date(clean);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const ensureSection = () => {
    const form = document.querySelector("[data-car-form]");
    if (!form) return null;

    let section = document.getElementById(SECTION_ID);
    if (!section) {
      section = document.createElement("section");
      section.id = SECTION_ID;
      section.className = "admin-simple-reservation";
      section.innerHTML = `
        <div class="admin-simple-reservation__head">
          <strong>Rezerv statusu</strong>
          <span>Bu maşın üçün rezerv olub-olmadığını, götürülmə və qaytarılış tarixini ayrıca saxla.</span>
        </div>
        <div class="admin-form-grid admin-form-grid--two">
          <label class="admin-field admin-field--full admin-checkbox-field">
            <span>Rezerv olunub</span>
            <label class="admin-checkbox">
              <input type="checkbox" name="isReserved" />
              <span>Bu maşın hazırda rezerv göstərilsin</span>
            </label>
          </label>
        </div>
        <div class="admin-form-grid admin-form-grid--two admin-simple-reservation__fields" data-simple-reservation-fields hidden>
          <label class="admin-field">
            <span>Götürülmə tarixi və saatı</span>
            <input type="datetime-local" name="reservationStartDateTime" />
          </label>
          <label class="admin-field">
            <span>Qayıdış tarixi və saatı</span>
            <input type="datetime-local" name="reservationEndDateTime" />
          </label>
          <label class="admin-field admin-field--full">
            <span>Rezerv qeydi</span>
            <textarea name="reservationNote" rows="3" placeholder="İstəyə bağlı qeyd"></textarea>
          </label>
        </div>
      `;

      const target = form.querySelector(".admin-grid.admin-grid--two") || form.lastElementChild;
      if (target) target.insertAdjacentElement("beforebegin", section);
      else form.appendChild(section);
    }

    return section;
  };

  const syncVisibility = () => {
    const form = document.querySelector("[data-car-form]");
    if (!form) return;
    const fields = form.querySelector("[data-simple-reservation-fields]");
    const reservedField = form.elements.namedItem("isReserved");
    const startField = form.elements.namedItem("reservationStartDateTime");
    const endField = form.elements.namedItem("reservationEndDateTime");

    if (!fields || !reservedField) return;

    const visible = Boolean(reservedField.checked);
    fields.hidden = !visible;
    if (startField) startField.required = visible;
    if (endField) endField.required = visible;
  };

  const populateReservationFields = async () => {
    const form = document.querySelector("[data-car-form]");
    const dialog = document.querySelector('[data-dialog="car"]');
    if (!form || !dialog || dialog.hidden) return;

    const id = form.elements.namedItem("id") ? form.elements.namedItem("id").value : "";
    const slug = form.elements.namedItem("slug") ? form.elements.namedItem("slug").value : "";

    const record = (id || slug)
      ? await Data.getSimpleReservationForCar({ id, slug }).catch(() => Data.normalizeSimpleReservationRecord({}))
      : Data.normalizeSimpleReservationRecord({});

    const reservedField = form.elements.namedItem("isReserved");
    const startField = form.elements.namedItem("reservationStartDateTime");
    const endField = form.elements.namedItem("reservationEndDateTime");
    const noteField = form.elements.namedItem("reservationNote");

    if (reservedField) reservedField.checked = Boolean(record.isReserved);
    if (startField) startField.value = toLocalDateTimeValue(record.reservationStartDateTime);
    if (endField) endField.value = toLocalDateTimeValue(record.reservationEndDateTime);
    if (noteField) noteField.value = record.reservationNote || "";
    syncVisibility();
  };

  const bindEvents = () => {
    const form = document.querySelector("[data-car-form]");
    if (!form || form.dataset.simpleReservationBound === "true") return;

    form.addEventListener("change", (event) => {
      if (event.target && event.target.name === "isReserved") {
        syncVisibility();
      }
    });

    const dialog = document.querySelector('[data-dialog="car"]');
    if (dialog) {
      const observer = new MutationObserver(() => {
        if (!dialog.hidden) {
          window.setTimeout(populateReservationFields, 30);
          window.setTimeout(populateReservationFields, 220);
        }
      });
      observer.observe(dialog, {
        attributes: true,
        attributeFilter: ["hidden"],
      });
    }

    form.dataset.simpleReservationBound = "true";
  };

  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    ensureSection();
    bindEvents();
    syncVisibility();
  });
})();