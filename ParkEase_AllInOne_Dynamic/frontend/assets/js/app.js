/**
 * ParkEase — Dynamic Frontend Application Controller
 * Handles live API interactions, state management, UI rendering,
 * and seamless single-link connectivity for all pages.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Current year in footer
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  // Dynamic Navbar state across all pages
  setupNavbarUser();

  // Password visibility toggles
  document.querySelectorAll("[data-password-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.querySelector(btn.getAttribute("data-password-toggle"));
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      btn.classList.toggle("bi-eye");
      btn.classList.toggle("bi-eye-slash");
    });
  });

  // Page-specific initializers based on present DOM elements
  if (document.getElementById("loginForm")) initLoginPage();
  if (document.getElementById("registerForm")) initRegisterPage();
  if (document.getElementById("slotGrid") || document.getElementById("locationSelect")) initParkingPage();
  if (document.getElementById("bookingForm")) initBookingPage();
  if (document.getElementById("paymentForm") || document.getElementById("payNowBtn")) initPaymentPage();
  if (document.getElementById("userDashboardView")) initDashboardPage();
  if (document.getElementById("bookingHistoryTable")) initHistoryPage();
  if (document.getElementById("profileForm")) initProfilePage();
  if (document.getElementById("adminDashboardView")) initAdminPage();
  if (document.getElementById("landingHero")) initLandingPage();
});

// Toast / Alert Notification Helper
function showToast(message, type = "info") {
  const toastBox = document.getElementById("appToast") || document.getElementById("demoToast");
  if (toastBox && window.bootstrap) {
    const body = toastBox.querySelector(".toast-body") || toastBox;
    body.textContent = message;
    bootstrap.Toast.getOrCreateInstance(toastBox).show();
  } else {
    alert(message);
  }
}

// Global Navbar User Authentication State
function getSitePrefix() {
  return window.location.pathname.includes("/admin/") ? "../" : "";
}

function setupNavbarUser() {
  const user = SPMS.getUser();
  const navContainer = document.getElementById("navUserArea");
  if (!navContainer) return;

  const prefix = getSitePrefix();

  if (user && SPMS.isLoggedIn()) {
    const role = String(user.role || "").toUpperCase();
    const initials = (user.full_name || "User").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const targetDashboard = role === "ADMIN" 
      ? (prefix ? "dashboard.html" : "admin/dashboard.html") 
      : (prefix ? "../dashboard.html" : "dashboard.html");

    const badgeClass = role === "ADMIN" ? "badge bg-dark text-white" : "badge bg-primary text-white";

    navContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="${targetDashboard}" class="btn btn-outline-custom btn-sm">
          <i class="bi ${role === 'ADMIN' ? 'bi-shield-lock-fill' : 'bi-speedometer2'} me-1"></i>
          ${role === "ADMIN" ? "Admin Console" : "Driver Dashboard"}
        </a>
        <div class="d-none d-md-block text-end">
          <div class="fw-bold small">${user.full_name || user.email}</div>
          <span class="${badgeClass}" style="font-size:10px">${role === "ADMIN" ? "Administrator" : "Driver"}</span>
        </div>
        <a href="${prefix}profile.html" class="profile-avatar text-white text-decoration-none" style="width:36px;height:36px;border-radius:10px;font-size:13px">${initials}</a>
        <button id="navLogoutBtn" class="btn btn-outline-danger btn-sm" title="Logout"><i class="bi bi-box-arrow-right"></i></button>
      </div>
    `;
    const logoutBtn = document.getElementById("navLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await SPMS.logout();
        window.location.href = prefix + "index.html";
      });
    }
  } else {
    navContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="${prefix}login.html" class="btn btn-outline-custom btn-sm">Login</a>
        <a href="${prefix}register.html" class="btn btn-primary-custom btn-sm">Register</a>
      </div>
    `;
  }
}

/* ==========================================================================
   1. LOGIN PAGE CONTROLLER
   ========================================================================== */
function initLoginPage() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginEmail");
  const passInput = document.getElementById("loginPassword");
  const submitBtn = document.getElementById("loginSubmitBtn");
  const errBox = document.getElementById("loginError");

  // Quick 1-click Demo Account Buttons
  document.querySelectorAll("[data-demo-login]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const role = btn.getAttribute("data-demo-login");
      if (role === "admin") {
        emailInput.value = "admin@parkease.com";
        passInput.value = "Admin@123";
      } else {
        emailInput.value = "aarav@example.com";
        passInput.value = "User@1234";
      }
      form.requestSubmit();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.classList.add("d-none");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Logging in...`;

    try {
      const email = emailInput.value.trim();
      const password = passInput.value;
      const user = await SPMS.login(email, password);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        window.location.href = redirect;
      } else if (user.role === "ADMIN") {
        window.location.href = "admin/dashboard.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } catch (err) {
      errBox.textContent = err.message || "Invalid email or password. Please try again.";
      errBox.classList.remove("d-none");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Login <i class="bi bi-arrow-right ms-1"></i>`;
    }
  });
}

/* ==========================================================================
   2. REGISTER PAGE CONTROLLER
   ========================================================================== */
function initRegisterPage() {
  const form = document.getElementById("registerForm");
  const errBox = document.getElementById("registerError");
  const submitBtn = document.getElementById("registerSubmitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.classList.add("d-none");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Creating account...`;

    try {
      const fullName = document.getElementById("regFullName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const mobile = document.getElementById("regMobile").value.trim();
      const password = document.getElementById("regPassword").value;

      await SPMS.register(fullName, email, mobile, password);
      window.location.href = "dashboard.html";
    } catch (err) {
      errBox.textContent = err.message || "Registration failed. Please check inputs.";
      errBox.classList.remove("d-none");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Create Account`;
    }
  });
}

/* ==========================================================================
   3. PARKING DISCOVERY & REAL-TIME SLOTS CONTROLLER
   ========================================================================== */
function initParkingPage() {
  const locSelect = document.getElementById("locationSelect");
  const dateInput = document.getElementById("filterDate");
  const timeInput = document.getElementById("filterTime");
  const durationSelect = document.getElementById("filterDuration");
  const searchInput = document.getElementById("slotSearch");
  const grid = document.getElementById("slotGrid");
  const summaryBox = document.getElementById("slotSummary");
  const continueBtn = document.getElementById("continueBookingBtn");
  const zoneInfoText = document.getElementById("zoneInfoText");

  let allSlots = [];
  let selectedSlot = null;
  let locationsMap = {};

  // Default to today and current hour rounded up
  const now = new Date();
  if (dateInput && !dateInput.value) {
    dateInput.value = now.toISOString().split("T")[0];
  }
  if (timeInput && !timeInput.value) {
    const nextHour = (now.getHours() + 1) % 24;
    timeInput.value = `${String(nextHour).padStart(2, "0")}:00`;
  }

  // Load locations dynamically from API
  async function loadLocations() {
    try {
      const locs = await SPMS.locations();
      locSelect.innerHTML = "";
      locs.forEach((loc, idx) => {
        locationsMap[loc.location_id] = loc;
        const opt = document.createElement("option");
        opt.value = loc.location_id;
        opt.textContent = `${loc.name} (${loc.available_slots}/${loc.total_slots} free)`;
        if (idx === 0) opt.selected = true;
        locSelect.appendChild(opt);
      });
      await loadSlots();
    } catch (err) {
      console.error("Failed to load locations:", err);
      if (grid) grid.innerHTML = `<div class="col-12 alert alert-warning">Unable to connect to backend: ${err.message}</div>`;
    }
  }

  // Fetch slot inventory for selected parameters
  async function loadSlots() {
    if (!locSelect.value) return;
    grid.innerHTML = `<div class="col-12 py-5 text-center text-muted"><span class="spinner-border text-primary me-2"></span>Loading live slot inventory...</div>`;
    selectedSlot = null;
    updateSummaryPanel();

    try {
      const locationId = parseInt(locSelect.value);
      const dateVal = dateInput ? dateInput.value : undefined;
      const timeVal = timeInput ? timeInput.value : undefined;
      const durationVal = durationSelect ? parseInt(durationSelect.value) : 2;

      const res = await SPMS.slots({
        location_id: locationId,
        date: dateVal,
        start_time: timeVal,
        duration_hours: durationVal
      });

      allSlots = res.slots || [];
      const availCount = allSlots.filter(s => s.status === "AVAILABLE").length;
      if (zoneInfoText) {
        zoneInfoText.textContent = `${availCount} of ${allSlots.length} slots currently available`;
      }
      renderSlots(allSlots);
    } catch (err) {
      grid.innerHTML = `<div class="col-12 alert alert-danger">Error loading slots: ${err.message}</div>`;
    }
  }

  function renderSlots(slots) {
    grid.innerHTML = "";
    if (!slots.length) {
      grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">No parking slots found matching criteria.</div>`;
      return;
    }

    slots.forEach(slot => {
      const isAvailable = slot.status === "AVAILABLE";
      const badgeClass = slot.status === "AVAILABLE" ? "badge-available" :
                         slot.status === "OCCUPIED" ? "badge-occupied" : "badge-reserved";
      const icon = slot.vehicle_type === "BIKE" ? "bi-bicycle" :
                   slot.vehicle_type === "EV" ? "bi-lightning-charge-fill text-warning" : "bi-car-front-fill";

      const card = document.createElement("div");
      card.className = `slot-card ${isAvailable ? "" : "disabled"} ${selectedSlot && selectedSlot.slot_id === slot.slot_id ? "selected" : ""}`;
      card.setAttribute("data-slot-id", slot.slot_id);

      card.innerHTML = `
        <div class="slot-top">
          <span class="slot-no"><i class="bi ${icon} me-1"></i>${slot.slot_no}</span>
          <span class="badge badge-soft ${badgeClass}">${slot.status}</span>
        </div>
        <div class="slot-meta">
          <span>₹${slot.rate_per_hour}/hr</span> • ${slot.vehicle_type}
          ${slot.has_charger ? ' • <span class="text-success"><i class="bi bi-ev-station"></i> EV</span>' : ""}
        </div>
      `;

      if (isAvailable) {
        card.addEventListener("click", () => {
          document.querySelectorAll(".slot-card").forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          selectSlot(slot);
        });
      }

      grid.appendChild(card);
    });
  }

  async function selectSlot(slot) {
    selectedSlot = slot;
    const duration = durationSelect ? parseInt(durationSelect.value) : 2;
    try {
      const quote = await SPMS.quote(slot.slot_id, duration);
      selectedSlot.quote = quote;
      updateSummaryPanel();
    } catch (err) {
      console.error("Quote calculation error:", err);
      updateSummaryPanel();
    }
  }

  function updateSummaryPanel() {
    if (!summaryBox) return;
    if (!selectedSlot) {
      summaryBox.innerHTML = `
        <h5 class="fw-bold">Booking Summary</h5>
        <div class="small text-muted-custom mb-3">No slot selected. Pick an available slot to view price quote.</div>
        <div class="invoice-box">
          <div class="d-flex justify-content-between mb-2"><span>Parking fee</span><strong>—</strong></div>
          <div class="d-flex justify-content-between mb-2"><span>Duration</span><strong>—</strong></div>
          <div class="d-flex justify-content-between mb-2"><span>Service fee</span><strong>₹10</strong></div>
          <hr>
          <div class="d-flex justify-content-between"><span class="fw-semibold">Total</span><strong>—</strong></div>
        </div>
        <button class="btn btn-secondary w-100 mt-3" disabled>Select a Slot First</button>
      `;
      if (continueBtn) continueBtn.classList.add("disabled");
      return;
    }

    const q = selectedSlot.quote || {
      parking_fee: selectedSlot.rate_per_hour * (parseInt(durationSelect?.value || 2)),
      service_fee: 10,
      total_amount: (selectedSlot.rate_per_hour * (parseInt(durationSelect?.value || 2))) + 10
    };

    const loc = locationsMap[selectedSlot.location_id] || { name: "City Center Parking" };

    summaryBox.innerHTML = `
      <h5 class="fw-bold">Booking Summary</h5>
      <div class="small text-success fw-bold mb-3"><i class="bi bi-check-circle-fill me-1"></i> Slot ${selectedSlot.slot_no} Selected</div>
      <div class="invoice-box">
        <div class="d-flex justify-content-between mb-2"><span>Location</span><strong>${loc.name}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Slot No</span><strong>${selectedSlot.slot_no} (${selectedSlot.vehicle_type})</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Rate</span><strong>₹${selectedSlot.rate_per_hour}/hr</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Duration</span><strong>${durationSelect?.value || 2} hrs</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Parking fee</span><strong>₹${q.parking_fee}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Service fee</span><strong>₹${q.service_fee}</strong></div>
        <hr>
        <div class="d-flex justify-content-between fs-5"><span class="fw-semibold">Total</span><strong class="text-primary-custom">₹${q.total_amount}</strong></div>
      </div>
      <button id="summaryContinueBtn" class="btn btn-primary-custom w-100 mt-3">Continue Booking <i class="bi bi-arrow-right ms-1"></i></button>
      <div class="small text-muted-custom mt-3"><i class="bi bi-shield-check text-success me-1"></i> 10-minute hold guaranteed upon checkout</div>
    `;

    document.getElementById("summaryContinueBtn")?.addEventListener("click", () => {
      proceedToBooking();
    });
  }

  function proceedToBooking() {
    if (!selectedSlot) return;
    const pendingData = {
      slot_id: selectedSlot.slot_id,
      slot_no: selectedSlot.slot_no,
      location_id: selectedSlot.location_id,
      location_name: locationsMap[selectedSlot.location_id]?.name || "Parking Location",
      vehicle_type: selectedSlot.vehicle_type,
      rate_per_hour: selectedSlot.rate_per_hour,
      date: dateInput.value,
      start_time: timeInput.value,
      duration_hours: parseInt(durationSelect?.value || 2),
      quote: selectedSlot.quote
    };
    sessionStorage.setItem("parkease_pending_slot", JSON.stringify(pendingData));
    window.location.href = "booking.html";
  }

  // Event Listeners for Filters
  locSelect?.addEventListener("change", loadSlots);
  dateInput?.addEventListener("change", loadSlots);
  timeInput?.addEventListener("change", loadSlots);
  durationSelect?.addEventListener("change", () => {
    if (selectedSlot) selectSlot(selectedSlot);
    else loadSlots();
  });

  searchInput?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = allSlots.filter(s =>
      s.slot_no.toLowerCase().includes(q) ||
      s.vehicle_type.toLowerCase().includes(q) ||
      (s.description || "").toLowerCase().includes(q)
    );
    renderSlots(filtered);
  });

  loadLocations();
}

/* ==========================================================================
   4. BOOKING FORM & SLOT CONFIRMATION CONTROLLER
   ========================================================================== */
function initBookingPage() {
  const form = document.getElementById("bookingForm");
  const slotInput = document.getElementById("selectedSlot");
  const zoneInput = document.getElementById("selectedZone");
  const dateInput = document.getElementById("bookingDate");
  const timeInput = document.getElementById("bookingTime");
  const durationSelect = document.getElementById("bookingDuration");
  const vehicleTypeSelect = document.getElementById("vehicleType");
  const vehicleNoInput = document.getElementById("vehicleNumber");
  const specialNotesInput = document.getElementById("specialRequest");
  const summaryBox = document.getElementById("bookingSummaryBox");
  const submitBtn = document.getElementById("bookingSubmitBtn");
  const authNotice = document.getElementById("bookingAuthNotice");

  let pendingSlot = null;
  try {
    const saved = sessionStorage.getItem("parkease_pending_slot");
    if (saved) pendingSlot = JSON.parse(saved);
  } catch (e) {}

  // Redirect if no slot selected
  if (!pendingSlot) {
    pendingSlot = {
      slot_id: 1,
      slot_no: "A-01",
      location_id: 1,
      location_name: "City Center Parking",
      vehicle_type: "CAR",
      rate_per_hour: 60,
      date: new Date().toISOString().split("T")[0],
      start_time: "19:00",
      duration_hours: 2
    };
  }

  // Pre-fill form fields
  if (slotInput) slotInput.value = pendingSlot.slot_no;
  if (zoneInput) zoneInput.value = `${pendingSlot.location_name} • Slot ${pendingSlot.slot_no}`;
  if (dateInput) dateInput.value = pendingSlot.date || new Date().toISOString().split("T")[0];
  if (timeInput) timeInput.value = pendingSlot.start_time || "19:00";
  if (durationSelect) durationSelect.value = pendingSlot.duration_hours || "2";
  if (vehicleTypeSelect) vehicleTypeSelect.value = pendingSlot.vehicle_type || "CAR";

  // Pre-fill user profile if logged in
  if (SPMS.isLoggedIn()) {
    const user = SPMS.getUser();
    if (user && user.vehicle_no && vehicleNoInput) {
      vehicleNoInput.value = user.vehicle_no;
    }
    if (authNotice) authNotice.classList.add("d-none");
  } else {
    if (authNotice) {
      authNotice.classList.remove("d-none");
      authNotice.innerHTML = `
        <div class="alert alert-warning py-2 mb-3 small d-flex justify-content-between align-items-center">
          <span><i class="bi bi-info-circle me-1"></i> Please log in to complete your booking reservation.</span>
          <a href="login.html?redirect=booking.html" class="btn btn-sm btn-dark">Login Now</a>
        </div>
      `;
    }
  }

  function updatePriceDisplay() {
    const hours = parseInt(durationSelect?.value || 2);
    const rate = pendingSlot.rate_per_hour || 60;
    const parkingFee = rate * hours;
    const serviceFee = 10;
    const total = parkingFee + serviceFee;

    if (summaryBox) {
      summaryBox.innerHTML = `
        <div class="d-flex align-items-center gap-3 my-3">
          <div class="profile-avatar" style="width:52px;height:52px;border-radius:14px;font-size:16px">${pendingSlot.slot_no}</div>
          <div>
            <div class="fw-bold">${pendingSlot.location_name}</div>
            <div class="small text-muted-custom">Slot ${pendingSlot.slot_no} (${vehicleTypeSelect?.value || "Car"})</div>
          </div>
        </div>
        <div class="d-flex justify-content-between mb-2"><span>Date</span><strong>${dateInput?.value || "Today"}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Start Time</span><strong>${timeInput?.value || "19:00"}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Duration</span><strong>${hours} hours</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Parking Fee</span><strong>₹${parkingFee}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Service Fee</span><strong>₹${serviceFee}</strong></div>
        <hr>
        <div class="d-flex justify-content-between fs-5"><span class="fw-semibold">Payable</span><strong class="text-primary-custom">₹${total}</strong></div>
        <div class="alert alert-soft p-2 mt-3 small mb-0"><i class="bi bi-clock me-1"></i> Slot held for 10 minutes during checkout.</div>
      `;
    }
  }

  durationSelect?.addEventListener("change", updatePriceDisplay);
  timeInput?.addEventListener("change", updatePriceDisplay);
  dateInput?.addEventListener("change", updatePriceDisplay);
  vehicleTypeSelect?.addEventListener("change", updatePriceDisplay);
  updatePriceDisplay();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!SPMS.isLoggedIn()) {
      sessionStorage.setItem("parkease_pending_slot", JSON.stringify(pendingSlot));
      window.location.href = "login.html?redirect=booking.html";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Reserving slot...`;

    try {
      const payload = {
        slot_id: pendingSlot.slot_id,
        vehicle_type: vehicleTypeSelect?.value || pendingSlot.vehicle_type,
        vehicle_no: vehicleNoInput.value.trim().toUpperCase(),
        date: dateInput.value,
        start_time: timeInput.value,
        duration_hours: parseInt(durationSelect.value),
        special_request: specialNotesInput?.value?.trim() || ""
      };

      const res = await SPMS.createBooking(payload);
      sessionStorage.setItem("parkease_active_booking", JSON.stringify(res.booking));
      window.location.href = `payment.html?booking_id=${res.booking.booking_id}`;
    } catch (err) {
      alert("Booking failed: " + (err.message || "Please choose another slot or time."));
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Proceed to Payment <i class="bi bi-arrow-right ms-1"></i>`;
    }
  });
}

/* ==========================================================================
   5. PAYMENT & INSTANT QR PASS GENERATION CONTROLLER
   ========================================================================== */
function initPaymentPage() {
  const summaryBox = document.getElementById("paymentOrderSummary");
  const payBtn = document.getElementById("payNowBtn");
  const upiRadio = document.getElementById("methodUpi");
  const cardRadio = document.getElementById("methodCard");
  const upiDetails = document.getElementById("upiDetailsGroup");
  const cardDetails = document.getElementById("cardDetailsGroup");
  const qrDisplay = document.getElementById("paymentQrArea");

  const params = new URLSearchParams(window.location.search);
  const bookingIdFromUrl = params.get("booking_id");

  let activeBooking = null;
  try {
    const raw = sessionStorage.getItem("parkease_active_booking");
    if (raw) activeBooking = JSON.parse(raw);
  } catch (e) {}

  async function loadBookingData() {
    if (!SPMS.isLoggedIn()) {
      window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.href);
      return;
    }

    try {
      const idToFetch = bookingIdFromUrl || (activeBooking ? activeBooking.booking_id : null);
      if (idToFetch) {
        const res = await SPMS.booking(idToFetch);
        activeBooking = res.booking;
      }
    } catch (err) {
      console.warn("Could not fetch remote booking:", err);
    }

    if (!activeBooking) {
      activeBooking = {
        booking_id: "PK-2026-DEMO",
        slot_no: "A-01",
        location_name: "City Center Parking",
        vehicle_no: "MP09AB1234",
        duration_hours: 2,
        parking_fee: 120,
        service_fee: 10,
        total_amount: 130,
        status: "PENDING"
      };
    }

    renderSummary();
  }

  function renderSummary() {
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div class="d-flex justify-content-between mb-2"><span>Booking ID</span><strong>#${activeBooking.booking_id}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Location</span><strong>${activeBooking.location_name || "City Center"}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Slot</span><strong>${activeBooking.slot_no}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Vehicle</span><strong>${activeBooking.vehicle_no || "Car"}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Duration</span><strong>${activeBooking.duration_hours || 2} hours</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Parking Fee</span><strong>₹${activeBooking.parking_fee || 120}</strong></div>
        <div class="d-flex justify-content-between mb-2"><span>Service Fee</span><strong>₹${activeBooking.service_fee || 10}</strong></div>
        <hr>
        <div class="d-flex justify-content-between fs-5"><strong class="fw-bold">Total Payable</strong><strong class="text-primary-custom">₹${activeBooking.total_amount || 130}</strong></div>
      `;
    }
    if (payBtn) {
      payBtn.textContent = `Pay ₹${activeBooking.total_amount || 130} & Confirm Booking`;
    }
  }

  // Toggle UPI / Card inputs
  upiRadio?.addEventListener("change", () => {
    if (upiDetails) upiDetails.classList.remove("d-none");
    if (cardDetails) cardDetails.classList.add("d-none");
  });
  cardRadio?.addEventListener("change", () => {
    if (upiDetails) upiDetails.classList.add("d-none");
    if (cardDetails) cardDetails.classList.remove("d-none");
  });

  payBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    payBtn.disabled = true;
    payBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Processing Secure Payment...`;

    try {
      const method = cardRadio && cardRadio.checked ? "CARD" : "UPI";
      // 1. Create payment order in backend
      const initRes = await SPMS.startPayment(activeBooking.booking_id, method);
      const paymentId = initRes.payment.payment_id;

      // 2. Verify payment (using demo gateway token)
      const verifyPayload = method === "UPI"
        ? { upi_id: (document.getElementById("upiId")?.value || "aarav@upi").trim() }
        : { card_token: "tok_ok" };

      const verifyRes = await SPMS.verifyPayment(paymentId, verifyPayload);

      // 3. Show Success Confirmation View
      renderSuccessConfirmation(verifyRes.booking, verifyRes.payment);
    } catch (err) {
      alert("Payment error: " + (err.message || "Payment could not be processed."));
      payBtn.disabled = false;
      payBtn.innerHTML = `Pay ₹${activeBooking.total_amount || 130} & Confirm Booking`;
    }
  });

  function renderSuccessConfirmation(booking, payment) {
    const mainWrap = document.getElementById("paymentMainWrap") || document.querySelector("main .row");
    if (mainWrap) {
      const qrData = encodeURIComponent(`PARKEASE:${booking.booking_id}:${booking.slot_no}:${booking.qr_token || 'PASS'}`);
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;

      mainWrap.innerHTML = `
        <div class="col-lg-8 mx-auto">
          <div class="panel text-center p-4 p-md-5">
            <div class="mb-3">
              <span class="badge bg-success-subtle text-success p-3 rounded-circle fs-1"><i class="bi bi-check-lg"></i></span>
            </div>
            <h2 class="fw-bold text-success mb-2">Booking Confirmed!</h2>
            <p class="text-muted-custom mb-4">Your parking spot has been reserved successfully. Show your QR pass upon entry.</p>

            <div class="card bg-light border-0 rounded-4 p-4 mb-4 text-start">
              <div class="row g-3 align-items-center">
                <div class="col-md-5 text-center border-end-md">
                  <img src="${qrApiUrl}" alt="QR Pass" class="img-fluid rounded-3 border p-2 bg-white shadow-sm" style="max-width:180px">
                  <div class="small fw-bold mt-2 text-muted-custom">Digital Entry Pass</div>
                </div>
                <div class="col-md-7 ps-md-4">
                  <div class="small-label">Reservation Details</div>
                  <h4 class="fw-bold mb-1">${booking.location_name || "Parking Location"}</h4>
                  <div class="fs-5 fw-bold text-primary-custom mb-3">Slot: ${booking.slot_no} (${booking.vehicle_type})</div>
                  <div class="small mb-1"><strong>Booking ID:</strong> #${booking.booking_id}</div>
                  <div class="small mb-1"><strong>Vehicle No:</strong> ${booking.vehicle_no}</div>
                  <div class="small mb-1"><strong>Amount Paid:</strong> ₹${booking.total_amount} via ${payment.method}</div>
                  <div class="small text-muted-custom"><strong>Transaction Ref:</strong> ${payment.transaction_ref}</div>
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <a href="dashboard.html" class="btn btn-primary-custom px-4 py-2"><i class="bi bi-speedometer2 me-1"></i> Go to Dashboard</a>
              <a href="history.html" class="btn btn-outline-custom px-4 py-2"><i class="bi bi-clock-history me-1"></i> View All Bookings</a>
              <button onclick="window.print()" class="btn btn-outline-custom px-3 py-2"><i class="bi bi-printer me-1"></i> Print Pass</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  loadBookingData();
}

/* ==========================================================================
   6. USER DASHBOARD CONTROLLER (LIVE STATS & ACTIVE BOOKING)
   ========================================================================== */
function initDashboardPage() {
  if (!SPMS.isLoggedIn()) {
    window.location.href = "login.html?redirect=dashboard.html";
    return;
  }

  const user = SPMS.getUser();
  const userNameEl = document.getElementById("dashUserName");
  const greetingEl = document.getElementById("dashGreeting");
  const avatarEl = document.getElementById("dashUserAvatar");

  if (user) {
    const role = String(user.role || "").toUpperCase();
    const isAdmin = role === "ADMIN";

    if (userNameEl) userNameEl.textContent = user.full_name || user.email;
    if (greetingEl) greetingEl.textContent = `Good day, ${(user.full_name || (isAdmin ? 'Admin' : 'Driver')).split(' ')[0]} 👋`;
    if (avatarEl) {
      const initials = (user.full_name || "User").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      avatarEl.textContent = initials;
    }

    // If Admin is visiting the driver dashboard, show an Admin Switcher banner at the top
    const adminNotice = document.getElementById("dashAdminNotice");
    if (adminNotice) {
      if (isAdmin) {
        adminNotice.classList.remove("d-none");
        adminNotice.innerHTML = `
          <div class="alert alert-info py-3 px-3 mb-4 d-flex flex-wrap justify-content-between align-items-center rounded-4 shadow-sm border-0">
            <div>
              <i class="bi bi-shield-lock-fill text-primary me-2 fs-5"></i>
              <strong>Administrator Signed In:</strong> You are currently viewing the individual <em>Driver Dashboard</em>.
            </div>
            <div class="d-flex gap-2 mt-2 mt-md-0">
              <a href="admin/dashboard.html" class="btn btn-sm btn-primary"><i class="bi bi-speedometer2 me-1"></i> Open Admin Operations Console</a>
              <a href="backend-dashboard.html" class="btn btn-sm btn-outline-dark"><i class="bi bi-database-gear me-1"></i> Database Explorer</a>
            </div>
          </div>
        `;
      } else {
        adminNotice.classList.add("d-none");
      }
    }

    const adminLink = document.getElementById("dashAdminLink");
    if (adminLink && isAdmin) {
      adminLink.classList.remove("d-none");
    }
  }

  async function loadDashboardData() {
    try {
      const data = await SPMS.dashboard();
      const stats = data.stats || {};
      const active = data.active_booking;
      const recent = data.recent_bookings || [];

      // Update stat counter cards
      const activeCountEl = document.getElementById("dashStatActive");
      const totalCountEl = document.getElementById("dashStatTotal");
      const totalSpentEl = document.getElementById("dashStatSpent");
      const ratingEl = document.getElementById("dashStatRating");

      if (activeCountEl) activeCountEl.textContent = active ? "1" : "0";
      if (totalCountEl) totalCountEl.textContent = stats.total_bookings ?? recent.length;
      if (totalSpentEl) totalSpentEl.textContent = `₹${(stats.total_spent || 0).toLocaleString("en-IN")}`;
      if (ratingEl) ratingEl.textContent = stats.rating || "4.9";

      // Render Active Booking Panel
      const activePanel = document.getElementById("dashActivePanel");
      if (activePanel) {
        if (active) {
          activePanel.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold mb-1">Active Parking</h5>
                <span class="small text-muted-custom">Booking ID: #${active.booking_id}</span>
              </div>
              <span class="badge badge-soft ${active.status === 'CONFIRMED' ? 'badge-reserved' : 'badge-available'}">${active.status}</span>
            </div>
            <div class="row g-3">
              <div class="col-md-6"><div class="kpi"><div class="small-label">Parking Location</div><div class="fw-bold mt-1">${active.location_name}</div><div class="small text-muted-custom">Indore</div></div></div>
              <div class="col-md-6"><div class="kpi"><div class="small-label">Slot & Vehicle</div><div class="fw-bold mt-1">${active.slot_no} (${active.vehicle_type})</div><div class="small text-muted-custom">${active.vehicle_no}</div></div></div>
              <div class="col-md-6"><div class="kpi"><div class="small-label">Time Window</div><div class="fw-bold mt-1">${formatTime(active.start_time)} – ${formatTime(active.end_time)}</div><div class="small text-muted-custom">${formatDate(active.start_time)}</div></div></div>
              <div class="col-md-6"><div class="kpi"><div class="small-label">Amount Paid</div><div class="fw-bold mt-1">₹${active.total_amount}</div><div class="small text-muted-custom">Paid via Online</div></div></div>
            </div>
            <div class="d-flex flex-wrap gap-2 mt-4">
              <button class="btn btn-primary-custom" onclick="showQrModal('${active.booking_id}', '${active.slot_no}', '${active.qr_token || 'PASS'}')"><i class="bi bi-qr-code me-1"></i> View QR Pass</button>
              <button class="btn btn-outline-danger" onclick="cancelActiveBooking('${active.booking_id}')"><i class="bi bi-x-circle me-1"></i> Cancel Booking</button>
            </div>
          `;
        } else {
          activePanel.innerHTML = `
            <div class="p-4 text-center">
              <div class="mb-3"><span class="badge bg-light text-secondary p-3 rounded-circle fs-3"><i class="bi bi-p-square"></i></span></div>
              <h5 class="fw-bold">No Active Parking Reservation</h5>
              <p class="text-muted-custom mb-3 small">You have no active slot booked right now. Need a parking spot?</p>
              <a href="parking.html" class="btn btn-primary-custom btn-sm">+ Find & Book Slot</a>
            </div>
          `;
        }
      }

      // Render Recent Bookings Table
      const recentTbody = document.getElementById("dashRecentTbody");
      if (recentTbody) {
        if (!recent.length) {
          recentTbody.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-muted">No past bookings found.</td></tr>`;
        } else {
          recentTbody.innerHTML = recent.slice(0, 5).map(b => {
            const badgeClass = b.status === "CONFIRMED" ? "badge-reserved" :
                               b.status === "COMPLETED" ? "badge-available" :
                               b.status === "CANCELLED" ? "badge-occupied" : "badge-soft";
            return `
              <tr>
                <td><strong>#${b.booking_id}</strong><div class="small text-muted-custom">${formatDate(b.start_time)}</div></td>
                <td>${b.location_name || "City Center"}</td>
                <td>${b.slot_no}</td>
                <td><span class="badge badge-soft ${badgeClass}">${b.status}</span></td>
              </tr>
            `;
          }).join("");
        }
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    }
  }

  window.cancelActiveBooking = async (bookingId) => {
    if (!confirm(`Are you sure you want to cancel booking #${bookingId}?`)) return;
    try {
      await SPMS.cancelBooking(bookingId);
      showToast("Booking cancelled successfully.", "success");
      loadDashboardData();
    } catch (err) {
      alert("Cancellation error: " + err.message);
    }
  };

  window.showQrModal = (bookingId, slotNo, qrToken) => {
    const qrData = encodeURIComponent(`PARKEASE:${bookingId}:${slotNo}:${qrToken}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`;
    const modalHtml = `
      <div class="modal fade" id="qrPassModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 p-3">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold">Parking Entry QR Pass</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center py-4">
              <img src="${qrUrl}" alt="QR" class="img-fluid border rounded-3 p-2 bg-white shadow-sm mb-3" style="width:200px">
              <div class="fw-bold fs-5">Slot ${slotNo}</div>
              <div class="text-muted-custom small">Booking ID: #${bookingId}</div>
              <div class="small text-muted-custom mt-2">Scan at the smart barrier scanner upon arrival.</div>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-outline-custom w-100" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const old = document.getElementById("qrPassModal");
    if (old) old.remove();
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    const m = new bootstrap.Modal(document.getElementById("qrPassModal"));
    m.show();
  };

  loadDashboardData();
}

/* ==========================================================================
   7. BOOKING HISTORY CONTROLLER (WITH SEARCH, STATUS FILTER, RECEIPT)
   ========================================================================== */
function initHistoryPage() {
  if (!SPMS.isLoggedIn()) {
    window.location.href = "login.html?redirect=history.html";
    return;
  }

  const tbody = document.getElementById("historyTbody");
  const statusFilter = document.getElementById("historyStatusFilter");
  const searchInput = document.getElementById("historySearchInput");
  const applyBtn = document.getElementById("historyApplyBtn");

  let allHistory = [];

  async function loadHistory() {
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Loading booking history...</td></tr>`;

    try {
      const statusVal = statusFilter && statusFilter.value !== "ALL" ? statusFilter.value : undefined;
      const res = await SPMS.history({ status: statusVal });
      allHistory = res.bookings || [];
      renderHistoryTable(allHistory);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Error loading history: ${err.message}</td></tr>`;
    }
  }

  function renderHistoryTable(bookings) {
    if (!bookings.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No reservations found matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map(b => {
      const badgeClass = b.status === "CONFIRMED" ? "badge-reserved" :
                         b.status === "COMPLETED" ? "badge-available" :
                         b.status === "ACTIVE" ? "badge-available" : "badge-occupied";

      const canCancel = b.status === "CONFIRMED";
      const isPaid = b.status !== "CANCELLED" && b.status !== "PENDING";

      return `
        <tr>
          <td>
            <strong>#${b.booking_id}</strong>
            <div class="small text-muted-custom">${b.vehicle_type} • ${b.vehicle_no || "N/A"}</div>
          </td>
          <td>${b.location_name || "City Center"}</td>
          <td>
            ${formatDate(b.start_time)}<br>
            <span class="small text-muted-custom">${formatTime(b.start_time)} – ${formatTime(b.end_time)}</span>
          </td>
          <td><span class="badge bg-light text-dark border">${b.slot_no}</span></td>
          <td><strong>₹${b.total_amount}</strong></td>
          <td><span class="badge badge-soft ${badgeClass}">${b.status}</span></td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              ${isPaid ? `<button class="btn btn-outline-custom" onclick="openReceiptModal('${b.booking_id}')"><i class="bi bi-receipt"></i> Receipt</button>` : ""}
              ${canCancel ? `<button class="btn btn-outline-danger" onclick="cancelHistoryBooking('${b.booking_id}')">Cancel</button>` : ""}
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  window.cancelHistoryBooking = async (id) => {
    if (!confirm(`Cancel booking #${id}? A full refund will be recorded.`)) return;
    try {
      await SPMS.cancelBooking(id);
      showToast("Booking cancelled successfully.", "success");
      loadHistory();
    } catch (err) {
      alert("Cancellation error: " + err.message);
    }
  };

  window.openReceiptModal = async (id) => {
    try {
      const res = await SPMS.receipt(id);
      const r = res.receipt;
      const modalHtml = `
        <div class="modal fade" id="receiptModal" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 p-3">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold">Official Digital Receipt</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body py-3">
                <div class="border rounded-4 p-3 bg-light mb-3">
                  <div class="d-flex justify-content-between mb-1"><span>Receipt No:</span><strong>${r.receipt_number}</strong></div>
                  <div class="d-flex justify-content-between mb-1"><span>Booking ID:</span><strong>#${r.booking_id}</strong></div>
                  <div class="d-flex justify-content-between mb-1"><span>Customer:</span><strong>${r.customer_name}</strong></div>
                  <div class="d-flex justify-content-between mb-1"><span>Location:</span><strong>${r.location}</strong></div>
                  <div class="d-flex justify-content-between mb-1"><span>Slot No:</span><strong>${r.slot_no}</strong></div>
                  <div class="d-flex justify-content-between mb-1"><span>Date:</span><strong>${r.booking_date}</strong></div>
                  <hr>
                  <div class="d-flex justify-content-between mb-1"><span>Parking Fee:</span><span>₹${r.breakdown.parking_fee}</span></div>
                  <div class="d-flex justify-content-between mb-1"><span>Service Fee:</span><span>₹${r.breakdown.service_fee}</span></div>
                  <div class="d-flex justify-content-between fs-5 fw-bold"><span>Total Paid:</span><span class="text-success">₹${r.breakdown.total_amount}</span></div>
                </div>
                <div class="text-center small text-muted-custom">Generated on ${new Date().toLocaleDateString()} • ParkEase Smart Parking</div>
              </div>
              <div class="modal-footer border-0 pt-0">
                <button class="btn btn-outline-custom" onclick="window.print()"><i class="bi bi-printer me-1"></i> Print</button>
                <button class="btn btn-primary-custom" data-bs-dismiss="modal">Done</button>
              </div>
            </div>
          </div>
        </div>
      `;
      const old = document.getElementById("receiptModal");
      if (old) old.remove();
      document.body.insertAdjacentHTML("beforeend", modalHtml);
      new bootstrap.Modal(document.getElementById("receiptModal")).show();
    } catch (err) {
      alert("Error loading receipt: " + err.message);
    }
  };

  applyBtn?.addEventListener("click", loadHistory);
  statusFilter?.addEventListener("change", loadHistory);
  searchInput?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = allHistory.filter(b =>
      b.booking_id.toLowerCase().includes(q) ||
      (b.location_name || "").toLowerCase().includes(q) ||
      (b.slot_no || "").toLowerCase().includes(q) ||
      (b.vehicle_no || "").toLowerCase().includes(q)
    );
    renderHistoryTable(filtered);
  });

  loadHistory();
}

/* ==========================================================================
   8. USER PROFILE CONTROLLER
   ========================================================================== */
function initProfilePage() {
  if (!SPMS.isLoggedIn()) {
    window.location.href = "login.html?redirect=profile.html";
    return;
  }

  const nameInput = document.getElementById("profileFullName");
  const emailInput = document.getElementById("profileEmail");
  const mobileInput = document.getElementById("profileMobile");
  const cityInput = document.getElementById("profileCity");
  const vehicleInput = document.getElementById("profileVehicle");
  const sideName = document.getElementById("sideProfileName");
  const sideEmail = document.getElementById("sideProfileEmail");
  const sideMobile = document.getElementById("sideProfileMobile");
  const sideAvatar = document.getElementById("sideProfileAvatar");
  const sideBookingsBadge = document.getElementById("sideBookingsBadge");
  const form = document.getElementById("profileForm");
  const saveBtn = document.getElementById("profileSaveBtn");

  async function loadProfile() {
    try {
      const res = await SPMS.profile();
      const p = res.user;
      if (nameInput) nameInput.value = p.full_name || "";
      if (emailInput) emailInput.value = p.email || "";
      if (mobileInput) mobileInput.value = p.mobile || "";
      if (cityInput) cityInput.value = p.city || "Indore";
      if (vehicleInput) vehicleInput.value = p.vehicle_no || "";

      if (sideName) sideName.textContent = p.full_name || p.email;
      if (sideEmail) sideEmail.textContent = p.email;
      if (sideMobile) sideMobile.textContent = p.mobile || "Not specified";
      if (sideBookingsBadge) sideBookingsBadge.textContent = `${p.total_bookings || 0} Bookings`;

      if (sideAvatar) {
        const initials = (p.full_name || "User").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
        sideAvatar.textContent = initials;
      }
    } catch (err) {
      console.error("Profile load error:", err);
    }
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Saving...`;

    try {
      const payload = {
        full_name: nameInput.value.trim(),
        mobile: mobileInput.value.trim(),
        city: cityInput.value.trim(),
        vehicle_no: vehicleInput.value.trim().toUpperCase()
      };
      const res = await SPMS.updateProfile(payload);
      showToast("Profile updated successfully!", "success");
      loadProfile();
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `Save Changes`;
    }
  });

  loadProfile();
}

/* ==========================================================================
   9. ADMIN DASHBOARD CONTROLLER (LIVE REVENUE, OCCUPANCY, RESERVATIONS)
   ========================================================================== */
function initAdminPage() {
  const user = SPMS.getUser();
  const role = user ? String(user.role || "").toUpperCase() : "";
  const authBox = document.getElementById("adminAuthGate");
  const mainWrap = document.getElementById("adminMainWrap");

  if (!user || !SPMS.isLoggedIn()) {
    if (mainWrap) mainWrap.classList.add("d-none");
    if (authBox) {
      authBox.innerHTML = `
        <div class="container py-5 text-center">
          <div class="card p-5 mx-auto shadow-sm rounded-4 border-0" style="max-width:520px">
            <div class="mb-3"><span class="badge bg-danger-subtle text-danger p-3 rounded-circle fs-2"><i class="bi bi-shield-lock-fill"></i></span></div>
            <h4 class="fw-bold mb-2">Administrator Access Required</h4>
            <p class="text-muted-custom small mb-4">Please log in with the administrator credentials to view real-time parking metrics.</p>
            <div class="alert alert-soft small text-start mb-4">
              <strong>Admin Credentials:</strong><br>
              Email: <code>admin@parkease.com</code><br>
              Password: <code>Admin@123</code>
            </div>
            <a href="../login.html?redirect=admin/dashboard.html" class="btn btn-primary-custom w-100">Log in as Admin</a>
          </div>
        </div>
      `;
    }
    return;
  }

  if (role !== "ADMIN") {
    if (mainWrap) mainWrap.classList.add("d-none");
    if (authBox) {
      authBox.innerHTML = `
        <div class="container py-5 text-center">
          <div class="card p-5 mx-auto shadow-sm rounded-4 border-0" style="max-width:520px">
            <div class="mb-3"><span class="badge bg-warning-subtle text-warning p-3 rounded-circle fs-2"><i class="bi bi-exclamation-triangle"></i></span></div>
            <h4 class="fw-bold mb-2">Driver Account Detected</h4>
            <p class="text-muted-custom small mb-3">You are currently signed in as a <strong>Driver</strong> (<code>${user.email}</code>). This Operations Console requires an Administrator account.</p>
            <div class="d-flex flex-column gap-2 mt-3">
              <a href="../dashboard.html" class="btn btn-primary-custom"><i class="bi bi-speedometer2 me-1"></i> Return to Driver Dashboard</a>
              <button onclick="SPMS.logout().then(() => window.location.href='../login.html?redirect=admin/dashboard.html')" class="btn btn-outline-custom">Log in as Administrator</button>
            </div>
          </div>
        </div>
      `;
    }
    return;
  }

  // User is verified Admin
  if (mainWrap) mainWrap.classList.remove("d-none");
  const emailEl = document.getElementById("adminUserEmail");
  if (emailEl) emailEl.textContent = user.email;

  let chartInstance = null;

  async function loadAdminData() {
    try {
      const summary = await SPMS.adminSummary();

      // Update stat cards
      const totalSlotsEl = document.getElementById("adminTotalSlots");
      const occupiedEl = document.getElementById("adminOccupiedSlots");
      const dailyBookingsEl = document.getElementById("adminDailyBookings");
      const dailyRevenueEl = document.getElementById("adminDailyRevenue");

      if (totalSlotsEl) totalSlotsEl.textContent = summary.total_slots;
      if (occupiedEl) occupiedEl.textContent = summary.occupied_slots;
      if (dailyBookingsEl) dailyBookingsEl.textContent = summary.daily_bookings;
      if (dailyRevenueEl) dailyRevenueEl.textContent = `₹${(summary.daily_revenue || 0).toLocaleString("en-IN")}`;

      // Live Zone Status Cards
      const zoneContainer = document.getElementById("adminZoneStatusList");
      if (zoneContainer && summary.zones) {
        zoneContainer.innerHTML = summary.zones.map(z => `
          <div class="d-flex justify-content-between py-2 border-bottom align-items-center">
            <span><strong>${z.zone_name}</strong> <small class="text-muted-custom">(${z.location_name})</small></span>
            <span class="badge badge-soft ${z.free_slots > 0 ? 'badge-available' : 'badge-occupied'}">${z.free_slots} of ${z.total_slots} free</span>
          </div>
        `).join("");
      }

      // Live Occupancy Chart
      const chartCanvas = document.getElementById("occupancyChart");
      if (chartCanvas && window.Chart && summary.occupancy_trend) {
        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(chartCanvas, {
          type: "line",
          data: {
            labels: summary.occupancy_trend.labels || ["8 AM","10 AM","12 PM","2 PM","4 PM","6 PM","8 PM"],
            datasets: [{
              label: "Occupied Slots",
              data: summary.occupancy_trend.values || [0, 0, 0, 0, 0, 0, 0],
              borderColor: "#2563eb",
              backgroundColor: "rgba(37,99,235,0.1)",
              tension: 0.35,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
          }
        });
      }

      // Recent Reservations Table
      const bookingsRes = await SPMS.adminBookings();
      const tbody = document.getElementById("adminReservationsTbody");
      if (tbody && bookingsRes.bookings) {
        tbody.innerHTML = bookingsRes.bookings.slice(0, 10).map(b => `
          <tr>
            <td><strong>#${b.booking_id}</strong></td>
            <td>${b.user_name || "Customer"}</td>
            <td>${b.location_name || "City Center"}</td>
            <td>${b.slot_no}</td>
            <td>${formatTime(b.start_time)}</td>
            <td><strong>₹${b.total_amount}</strong></td>
            <td><span class="badge badge-soft ${b.status === 'CONFIRMED' ? 'badge-reserved' : b.status === 'COMPLETED' ? 'badge-available' : 'badge-occupied'}">${b.status}</span></td>
          </tr>
        `).join("");
      }
    } catch (err) {
      console.error("Admin dashboard load error:", err);
    }
  }

  loadAdminData();
}

/* ==========================================================================
   10. LANDING PAGE LIVE INVENTORY BADGE
   ========================================================================== */
async function initLandingPage() {
  const liveBadge = document.getElementById("landingLiveSlotsBadge");
  if (!liveBadge) return;
  try {
    const locs = await SPMS.locations();
    const totalAvail = locs.reduce((acc, loc) => acc + (loc.available_slots || 0), 0);
    liveBadge.innerHTML = `<i class="bi bi-circle-fill text-success me-1" style="font-size:8px"></i> ${totalAvail} Available Slots Across ${locs.length} Facilities`;
  } catch (e) {}
}

/* ==========================================================================
   UTILITY FORMATTING HELPERS
   ========================================================================== */
function formatDate(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return isoStr;
  }
}

function formatTime(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch (e) {
    return isoStr;
  }
}
