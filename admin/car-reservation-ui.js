(function () {
  const Data = window.RentacarData;
  if (!Data) return;

  const qs = (selector, scope = document) => scope.querySelector(selector);

  const toLocalInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const ensureStyles = () => {
    if (document.getElementById("admin-simple-reservation-styles")) return;
    const style = document.createElement("style");
    style.id = "admin-simple-reservation-styles";
    style.textContent = `
      .admin-reservation-panel {
        display: grid;
        gap: 12px;
        padding: 18px;
        border: 1px solid rgba(255, 107, 60, 0.14);
        border-radius: 22px;
        background: rgba(255, 249, 245, 0.86);
      }
      .admin-reservation-panel__head {
        display: grid;
        gap: 6px;
      }
      .admin-reservation-panel__head strong {
        font-family: "Outfit", sans-serif;
        font-size: 1.04rem;
      }
      .admin-reservation-panel__head p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
      }
      .admin-reservation-fields {
        display: grid;
        gap: 14px;
      }
      body[data-admin-theme="dark"] .admin-reservation-panel {
        border-color: rgba(255, 110, 64, 0.18);
        background: rgba(32, 24, 29, 0.92);
      }
      body[data-admin-theme="dark"] .admin-reservation-panel__head p {
        color: #d9c7bb;
      }
    `;
    document.head.appendChild(style);
  };

  const init = () => {
    const modal = qs('[data-dialog="car"]');
    const form = qs('[data-car-form]');
    if (!modal || !form || qs('[data-simple-reservation-panel]', form)) return;

    ensureStyles();

    const panel = document.createElement('section');
    panel.className = 'admin-reservation-panel admin-field admin-field--full';
    panel.setAttribute('data-simple-reservation-panel', '');
    panel.innerHTML = `
      <div class="admin-reservation-panel__head">
        <strong>Rezerv məlumatı</strong>
        <p>Bu hissə yalnız seçilən maşına aiddir. Aktiv olduqda public kartda və detail səhifədə tarix-saat görünəcək.</p>
      </div>
      <label class="admin-checkbox">
        <input type="checkbox" name="isReserved" />
        <span>Maşın rezerv olunub</span>
      </label>
      <div class="admin-form-grid admin-form-grid--two admin-reservation-fields" data-simple-reservation-fields hidden>
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
          <textarea name="reservationNote" rows="3" placeholder="Müştəri adı, çatdırılma saatı və ya əlavə qeyd"></textarea>
        </label>
      </div>
    `;

    const primaryGrid = form.querySelector('.admin-form-grid--two');
    const rentalDaysField = qs('[data-rental-days-field]', form);
    const insertionTarget = rentalDaysField || primaryGrid.lastElementChild;
    if (insertionTarget) insertionTarget.insertAdjacentElement('afterend', panel);
    else primaryGrid.appendChild(panel);

    const toggle = form.elements.namedItem('isReserved');
    const fieldsWrap = qs('[data-simple-reservation-fields]', panel);
    const startInput = form.elements.namedItem('reservationStartDateTime');
    const endInput = form.elements.namedItem('reservationEndDateTime');
    const noteInput = form.elements.namedItem('reservationNote');
    const idInput = form.elements.namedItem('id');
    const slugInput = form.elements.namedItem('slug');

    const syncVisibility = () => {
      const active = Boolean(toggle && toggle.checked);
      fieldsWrap.hidden = !active;
      [startInput, endInput, noteInput].forEach((field) => {
        if (!field) return;
        field.disabled = !active;
      });
    };

    const clearFields = () => {
      if (toggle) toggle.checked = false;
      if (startInput) startInput.value = '';
      if (endInput) endInput.value = '';
      if (noteInput) noteInput.value = '';
      syncVisibility();
    };

    const populateFields = async () => {
      if (modal.hidden) return;
      const carId = idInput ? idInput.value : '';
      const slug = slugInput ? slugInput.value : '';
      if (!carId && !slug) {
        clearFields();
        return;
      }

      try {
        const reservation = await Data.getSimpleReservationForCar({ id: carId, slug });
        if (toggle) toggle.checked = Boolean(reservation && reservation.isReserved);
        if (startInput) startInput.value = toLocalInputValue(reservation && reservation.reservationStartDateTime);
        if (endInput) endInput.value = toLocalInputValue(reservation && reservation.reservationEndDateTime);
        if (noteInput) noteInput.value = reservation && reservation.reservationNote ? reservation.reservationNote : '';
      } catch {
        clearFields();
      }
      syncVisibility();
    };

    let populateTimer = null;
    const queuePopulate = () => {
      window.clearTimeout(populateTimer);
      populateTimer = window.setTimeout(populateFields, 60);
    };

    toggle.addEventListener('change', syncVisibility);
    form.addEventListener('reset', () => window.setTimeout(clearFields, 0));
    form.addEventListener('input', (event) => {
      if (event.target === slugInput || event.target === idInput) queuePopulate();
    });
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-open-car-modal]') || event.target.closest('[data-edit-car]')) {
        window.setTimeout(queuePopulate, 40);
        window.setTimeout(queuePopulate, 180);
      }
    });

    const observer = new MutationObserver(() => queuePopulate());
    observer.observe(modal, { attributes: true, attributeFilter: ['hidden'] });

    syncVisibility();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
