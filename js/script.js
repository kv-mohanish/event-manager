const EVENTS = [
  {
    id: "tech-sprint",
    name: "Tech Sprint Hackathon",
    category: "Technical",
    date: "2026-06-12T09:30:00",
    description:
      "A 24-hour innovation challenge where teams build prototypes for real campus problems.",
  },
  {
    id: "code-quiz",
    name: "Code Quest Quiz",
    category: "Technical",
    date: "2026-06-15T11:00:00",
    description:
      "Fast-paced programming, web, and logic quiz for individual participants.",
  },
  {
    id: "rhythm-night",
    name: "Rhythm Night Dance Battle",
    category: "Cultural",
    date: "2026-06-18T17:30:00",
    description:
      "Solo and group performances judged on creativity, coordination, and stage presence.",
  },
  {
    id: "sports-league",
    name: "Inter-College Sports League",
    category: "Sports",
    date: "2026-06-20T07:00:00",
    description:
      "Track, football, badminton, and volleyball events across college teams.",
  },
  {
    id: "ui-workshop",
    name: "UI Design Workshop",
    category: "Workshop",
    date: "2026-06-22T10:00:00",
    description:
      "Hands-on session covering wireframes, accessibility, responsive grids, and prototypes.",
  },
  {
    id: "green-drive",
    name: "Green Campus Drive",
    category: "Social",
    date: "2026-06-25T08:30:00",
    description:
      "Volunteer-led clean-up, plantation, and awareness event for sustainable campuses.",
  },
];

const STORAGE_KEYS = {
  registrations: "smartEventRegistrations",
  theme: "smartEventTheme",
  feedback: "smartEventFeedback",
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function getRegistrations() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.registrations) || "[]");
}

function saveRegistrations(registrations) {
  localStorage.setItem(
    STORAGE_KEYS.registrations,
    JSON.stringify(registrations),
  );
}

function findEvent(eventId) {
  return EVENTS.find((eventItem) => eventItem.id === eventId);
}

function setupNavigation() {
  const toggle = $(".nav-toggle");
  const menu = $("#primary-menu");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  $$("#primary-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupSlider() {
  const slider = $("#hero-slider");

  if (!slider) {
    return;
  }

  const slides = $$(".slide", slider);
  const dots = $$(".slider-dot");
  let currentSlide = 0;

  const showSlide = (index) => {
    currentSlide = index;
    slides.forEach((slide, slideIndex) =>
      slide.classList.toggle("active", slideIndex === index),
    );
    dots.forEach((dot, dotIndex) =>
      dot.classList.toggle("active", dotIndex === index),
    );
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => showSlide(Number(dot.dataset.slide)));
  });

  setInterval(() => {
    showSlide((currentSlide + 1) % slides.length);
  }, 5000);
}

function setupEventListing() {
  const list = $("#event-list");
  const search = $("#event-search");
  const category = $("#category-filter");
  const sort = $("#date-sort");

  if (!list || !search || !category || !sort) {
    return;
  }

  const categories = [
    ...new Set(EVENTS.map((eventItem) => eventItem.category)),
  ];
  category.innerHTML += categories
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");

  const renderEvents = () => {
    const searchTerm = search.value.trim().toLowerCase();
    const categoryValue = category.value;
    const sortDirection = sort.value;

    const filteredEvents = getEvents()
      .filter((eventItem) => eventItem.name.toLowerCase().includes(searchTerm))
    const filteredEvents = EVENTS.filter((eventItem) =>
      eventItem.name.toLowerCase().includes(searchTerm),
    )
      .filter(
        (eventItem) =>
          categoryValue === "all" || eventItem.category === categoryValue,
      )
      .sort((first, second) => {
        const firstDate = new Date(first.date).getTime();
        const secondDate = new Date(second.date).getTime();
        return sortDirection === "asc"
          ? firstDate - secondDate
          : secondDate - firstDate;
      });

    if (!filteredEvents.length) {
      list.innerHTML =
        '<div class="empty-state"><h3>No events found</h3><p>Try a different search term or category filter.</p></div>';
      return;
    }

    list.innerHTML = filteredEvents
      .map((eventItem) => {
        const categoryClass = eventItem.category.toLowerCase();
        return `
        <article class="event-card">
          <div class="event-art ${categoryClass}"><h3>${eventItem.name}</h3></div>
          <div class="event-card-body">
            <div class="badge-row">
              <span class="badge">${eventItem.category}</span>
              <span>${formatDate(eventItem.date)}</span>
            </div>
            <p>${eventItem.description}</p>
            <a class="btn primary" href="register.html?event=${eventItem.id}">Register</a>
          </div>
        </article>
      `;
      })
      .join("");
  };

  [search, category, sort].forEach((control) =>
    control.addEventListener("input", renderEvents),
  );
  renderEvents();
}

function populateEventSelect() {
  const select = $("#eventId");

  if (!select) {
    return;
  }

  select.innerHTML += EVENTS.map(
    (eventItem) =>
      `<option value="${eventItem.id}">${eventItem.name} - ${formatDate(eventItem.date)}</option>`,
  ).join("");

  const params = new URLSearchParams(window.location.search);
  const requestedEvent = params.get("event");
  if (requestedEvent && findEvent(requestedEvent)) {
    select.value = requestedEvent;
  }
}

function setError(fieldName, message) {
  const error = $(`[data-error-for="${fieldName}"]`);
  if (error) {
    error.textContent = message;
  }
}

function clearErrors(form) {
  $$(".error", form).forEach((error) => {
    error.textContent = "";
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

function setupPasswordMeter() {
  const password = $("#password");
  const meter = $("#password-meter");
  const hint = $("#password-hint");

  if (!password || !meter || !hint) {
    return;
  }

  password.addEventListener("input", () => {
    const value = password.value;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    const labels = ["Not entered", "Weak", "Fair", "Good", "Strong"];
    meter.value = score;
    hint.textContent = `Password strength: ${labels[score]}`;
  });
}

function setupRegistrationForm() {
  const form = $("#registration-form");

  if (!form) {
    return;
  }

  populateEventSelect();
  setupPasswordMeter();

  const dateInput = $("#date");
  dateInput.valueAsDate = new Date();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(form);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const message = $("#registration-message");
    let valid = true;

    if (!data.fullName.trim()) {
      setError("fullName", "Full name is required.");
      valid = false;
    }
    if (!validateEmail(data.email.trim())) {
      setError("email", "Enter a valid email address.");
      valid = false;
    }
    if (!validatePhone(data.phone.trim())) {
      setError(
        "phone",
        "Enter a valid 10-digit mobile number starting with 6-9.",
      );
      valid = false;
    }
    if (!data.college.trim()) {
      setError("college", "College name is required.");
      valid = false;
    }
    if (!data.eventId) {
      setError("eventId", "Select an event.");
      valid = false;
    }
    if (!data.gender) {
      setError("gender", "Choose a gender option.");
      valid = false;
    }
    if (!data.date) {
      setError("date", "Select a registration date.");
      valid = false;
    }

    if (!valid) {
      message.className = "form-message error-message";
      message.textContent =
        "Please correct the highlighted fields before submitting.";
      return;
    }

    const registration = {
      id: crypto.randomUUID(),
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      college: data.college.trim(),
      eventId: data.eventId,
      gender: data.gender,
      date: data.date,
      createdAt: new Date().toISOString(),
    };

    const registrations = getRegistrations();
    registrations.push(registration);
    saveRegistrations(registrations);
    sessionStorage.setItem("lastRegistration", JSON.stringify(registration));

    message.className = "form-message success";
    message.textContent =
      "Registration saved successfully. Visit the dashboard to view your events.";
    form.reset();
    dateInput.valueAsDate = new Date();
    $("#password-meter").value = 0;
    $("#password-hint").textContent = "Password strength: Not entered";
  });
}

function getCountdownText(eventDate) {
  const difference = new Date(eventDate).getTime() - Date.now();

  if (difference <= 0) {
    return "Event started";
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function setupThemeToggle() {
  const toggle = $("#theme-toggle");
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  if (!toggle) {
    return;
  }

  const syncToggle = () => {
    const dark = document.body.classList.contains("dark-theme");
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.textContent = dark ? "☀️ Theme" : "🌙 Theme";
  };

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem(
      STORAGE_KEYS.theme,
      document.body.classList.contains("dark-theme") ? "dark" : "light",
    );
    syncToggle();
  });

  syncToggle();
}

function setupDashboard() {
  const list = $("#dashboard-list");
  const count = $("#registration-count");
  const clearButton = $("#clear-registrations");

  if (!list || !count || !clearButton) {
    return;
  }

  const renderDashboard = () => {
    const registrations = getRegistrations();
    count.textContent = registrations.length;

    if (!registrations.length) {
      list.innerHTML =
        '<div class="empty-state"><h3>No registrations yet</h3><p>Register for an event to see it here.</p><a class="btn primary" href="register.html">Register now</a></div>';
      return;
    }

    list.innerHTML = registrations
      .map((registration) => {
        const eventItem = findEvent(registration.eventId);
        const eventName = eventItem ? eventItem.name : "Event unavailable";
        const eventDate = eventItem ? eventItem.date : registration.createdAt;

        return `
        <article class="dashboard-item">
          <div>
            <h3>${escapeHtml(eventName)}</h3>
            <p><strong>Participant:</strong> ${escapeHtml(registration.fullName)} · <strong>College:</strong> ${escapeHtml(registration.college)}</p>
            <p><strong>Event date:</strong> ${formatDate(eventDate)} · <strong>Registered:</strong> ${escapeHtml(registration.date)}</p>
          </div>
          <div class="countdown" data-countdown="${escapeHtml(eventDate)}">${getCountdownText(eventDate)}</div>
        </article>
      `;
      })
      .join("");
  };

  clearButton.addEventListener("click", () => {
    saveRegistrations([]);
    renderDashboard();
  });

  renderDashboard();
  setInterval(() => {
    $$("[data-countdown]").forEach((timer) => {
      timer.textContent = getCountdownText(timer.dataset.countdown);
    });
  }, 1000);
}

function setupFeedbackForm() {
  const form = $("#feedback-form");

  if (!form) {
    return;
  }

  const ratingInput = $("#rating-value");
  const stars = $$("#star-rating button");
  const textArea = $("#feedback-text");
  const charCount = $("#char-count");
  const message = $("#feedback-message");

  const updateStars = (rating) => {
    stars.forEach((star) => {
      star.classList.toggle("active", Number(star.dataset.rating) <= rating);
    });
  };

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = Number(star.dataset.rating);
      ratingInput.value = rating;
      updateStars(rating);
      setError("rating-value", "");
    });
  });

  textArea.addEventListener("input", () => {
    charCount.textContent = textArea.value.length;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(form);
    let valid = true;

    if (!$("#feedback-name").value.trim()) {
      setError("feedback-name", "Name is required.");
      valid = false;
    }
    if (!validateEmail($("#feedback-email").value.trim())) {
      setError("feedback-email", "Enter a valid email address.");
      valid = false;
    }
    if (!ratingInput.value) {
      setError("rating-value", "Select a star rating.");
      valid = false;
    }
    if (!textArea.value.trim()) {
      setError("feedback-text", "Feedback message is required.");
      valid = false;
    }

    if (!valid) {
      message.className = "form-message error-message";
      message.textContent = "Please complete the required feedback fields.";
      return;
    }

    const feedback = {
      name: $("#feedback-name").value.trim(),
      email: $("#feedback-email").value.trim(),
      rating: Number(ratingInput.value),
      message: textArea.value.trim(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.feedback, JSON.stringify(feedback));
    message.className = "form-message success";
    message.textContent = "Thank you! Your feedback has been stored locally.";
    form.reset();
    ratingInput.value = "";
    charCount.textContent = "0";
    updateStars(0);
  });
}

function setupFaqAccordion() {
  $$("#faq-accordion .faq-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const isOpen = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function init() {
  setupNavigation();
  setupThemeToggle();
  setupSlider();
  setupEventListing();
  setupRegistrationForm();
  setupDashboard();
  setupFeedbackForm();
  setupFaqAccordion();
}

document.addEventListener("DOMContentLoaded", init);
