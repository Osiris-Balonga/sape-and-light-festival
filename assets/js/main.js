const whatsappNumber = "242061234567";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("has-js");

function initializeIcons() {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "aria-hidden": "true",
        "stroke-width": 2
      }
    });
  }
}

function initializeHeroMotion() {
  const content = document.querySelector(".hero__content");

  if (!content) return;

  requestAnimationFrame(() => content.classList.add("is-ready"));
}

function initializeHeaderScroll() {
  const header = document.querySelector(".site-header");

  if (!header) return;

  let ticking = false;
  let isScrolled = false;

  const updateHeader = () => {
    const shouldBeScrolled = window.scrollY > 24;

    if (shouldBeScrolled !== isScrolled) {
      header.classList.toggle("is-scrolled", shouldBeScrolled);
      isScrolled = shouldBeScrolled;
    }

    ticking = false;
  };

  const handleScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateHeader);
  };

  updateHeader();
  window.addEventListener("scroll", handleScroll, { passive: true });
}

function initializeMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-navigation");

  if (!toggle || !navigation) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      toggle.focus();
    }
  });
}

function initializeCountdown() {
  const countdown = document.querySelector("[data-countdown-date]");

  if (!countdown) return;

  const targetDate = Date.parse(countdown.dataset.countdownDate || "");
  const fields = {
    days: countdown.querySelector("[data-countdown-days]"),
    hours: countdown.querySelector("[data-countdown-hours]"),
    minutes: countdown.querySelector("[data-countdown-minutes]"),
    seconds: countdown.querySelector("[data-countdown-seconds]")
  };

  if (Number.isNaN(targetDate) || Object.values(fields).some((field) => !field)) {
    countdown.textContent = "La date d'ouverture sera annoncée très bientôt.";
    return;
  }

  const updateCountdown = () => {
    const difference = targetDate - Date.now();

    if (difference <= 0) {
      countdown.innerHTML = '<span class="countdown__intro">Le festival a commencé. À vous de briller.</span>';
      return true;
    }

    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference % 86400000) / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);

    fields.days.textContent = String(days).padStart(2, "0");
    fields.hours.textContent = String(hours).padStart(2, "0");
    fields.minutes.textContent = String(minutes).padStart(2, "0");
    fields.seconds.textContent = String(seconds).padStart(2, "0");
    return false;
  };

  if (!updateCountdown()) {
    const countdownInterval = window.setInterval(() => {
      if (updateCountdown()) window.clearInterval(countdownInterval);
    }, 1000);
  }
}

function initializeProgramTabs() {
  const tabList = document.querySelector(".program-tabs__list");

  if (!tabList) return;

  const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

  const activateTab = (tab, shouldAnimate = true) => {
    const panelId = tab.getAttribute("aria-controls");

    tabs.forEach((currentTab) => {
      const isSelected = currentTab === tab;
      currentTab.setAttribute("aria-selected", String(isSelected));
      currentTab.tabIndex = isSelected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isSelected = panel.id === panelId;
      panel.hidden = !isSelected;
      panel.classList.remove("is-active");

      if (isSelected && shouldAnimate && !reduceMotion) {
        requestAnimationFrame(() => panel.classList.add("is-active"));
      }
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;

      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    });
  });

  const selectedTab = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
  activateTab(selectedTab, false);
}

function initializeArtistFilter() {
  const filters = Array.from(document.querySelectorAll("[data-filter]"));
  const artists = Array.from(document.querySelectorAll("[data-category]"));
  const status = document.getElementById("lineup-status");
  const hideTimers = new WeakMap();

  if (!filters.length || !artists.length) return;

  const showArtist = (artist) => {
    window.clearTimeout(hideTimers.get(artist));
    artist.hidden = false;
    artist.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => artist.classList.remove("is-filtered-out"));
  };

  const hideArtist = (artist) => {
    artist.classList.add("is-filtered-out");
    artist.setAttribute("aria-hidden", "true");

    if (reduceMotion) {
      artist.hidden = true;
      return;
    }

    const timer = window.setTimeout(() => {
      if (artist.classList.contains("is-filtered-out")) artist.hidden = true;
    }, 230);
    hideTimers.set(artist, timer);
  };

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.filter;
      const label = filter.textContent.trim();
      let visibleCount = 0;

      filters.forEach((button) => {
        const isActive = button === filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      artists.forEach((artist) => {
        const shouldShow = category === "all" || artist.dataset.category === category;
        if (shouldShow) {
          visibleCount += 1;
          showArtist(artist);
        } else {
          hideArtist(artist);
        }
      });

      if (status) {
        status.textContent = `${visibleCount} artiste${visibleCount > 1 ? "s" : ""} affiché${visibleCount > 1 ? "s" : ""} pour ${label}.`;
      }
    });
  });
}

function initializeScrollReveals() {
  const elements = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!elements.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.12 }
  );

  elements.forEach((element) => observer.observe(element));
}

function initializeContactForm() {
  const form = document.querySelector(".contact-form");

  if (!form) return;

  const fields = [
    { element: form.elements.name, error: document.getElementById("name-error"), message: "Veuillez renseigner votre nom." },
    { element: form.elements.phone, error: document.getElementById("phone-error"), message: "Veuillez renseigner un numéro de téléphone." },
    { element: form.elements.message, error: document.getElementById("message-error"), message: "Veuillez écrire votre message." }
  ];
  const status = form.querySelector(".form-status");

  const validateField = (field) => {
    const isValid = field.element.value.trim().length > 0;
    field.element.closest(".form-field").classList.toggle("is-invalid", !isValid);
    field.error.textContent = isValid ? "" : field.message;
    field.element.setAttribute("aria-invalid", String(!isValid));
    field.element.setAttribute("aria-describedby", field.error.id);
    return isValid;
  };

  fields.forEach((field) => field.element.addEventListener("input", () => validateField(field)));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = fields.every(validateField);

    if (!isValid) {
      status.textContent = "Quelques informations sont à compléter.";
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    const message = [
      "Bonjour, j'ai une question pour le Festival Sape & Lumière.",
      "",
      "Nom : " + form.elements.name.value.trim(),
      "Téléphone : " + form.elements.phone.value.trim(),
      "Message : " + form.elements.message.value.trim()
    ].join("\n");
    const url = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);

    status.textContent = "Votre message est prêt dans WhatsApp.";
    window.open(url, "_blank", "noopener");
  });
}

initializeIcons();
initializeHeroMotion();
initializeHeaderScroll();
initializeMobileMenu();
initializeCountdown();
initializeProgramTabs();
initializeArtistFilter();
initializeScrollReveals();
initializeContactForm();
