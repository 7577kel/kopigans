// ══════════════════════════════════════════════════════════════
// SCRIPT.JS — Kopi Gans
// UI toggles + login + data harga & stok + animasi
// ══════════════════════════════════════════════════════════════

// ── Toggle hamburger ──
const navbarNav = document.querySelector(".navbar-nav");
const hm = document.querySelector("#hamburger-menu");
if (hm) hm.onclick = () => navbarNav.classList.toggle("active");

// ── Toggle search ──
const searchForm = document.querySelector(".search-form");
const searchBox = document.querySelector("#search-box");
const sb = document.querySelector("#search-button");
if (sb)
  sb.onclick = (e) => {
    searchForm.classList.toggle("active");
    searchBox.focus();
    e.preventDefault();
  };

// ── Toggle shopping cart ──
const shoppingCart = document.querySelector(".shopping-cart");
const sc = document.querySelector("#shopping-cart-bottom");
if (sc)
  sc.onclick = (e) => {
    shoppingCart.classList.toggle("active");
    e.preventDefault();
  };

function updateShoppingCartVisibilityBasedOnStock() {
  if (!sc) return;

  const hasAvailableItem =
    document.querySelector(".badge-available") !== null ||
    document.querySelector(".product-status.badge-available") !== null;

  if (hasAvailableItem) {
    sc.classList.remove("hidden-cart-placeholder");
  } else {
    sc.classList.add("hidden-cart-placeholder");
    if (shoppingCart) {
      shoppingCart.classList.remove("active");
    }
  }
}

function scheduleCartVisibilityCheck() {
  setTimeout(() => {
    updateShoppingCartVisibilityBasedOnStock();
    setTimeout(updateShoppingCartVisibilityBasedOnStock, 250);
  }, 150);
}

window.addEventListener("load", scheduleCartVisibilityCheck);
document.addEventListener("DOMContentLoaded", scheduleCartVisibilityCheck);

// ── Klik di luar → tutup semua ──
document.addEventListener("click", (e) => {
  if (
    hm &&
    navbarNav &&
    !hm.contains(e.target) &&
    !navbarNav.contains(e.target)
  )
    navbarNav.classList.remove("active");
  if (
    sb &&
    searchForm &&
    !sb.contains(e.target) &&
    !searchForm.contains(e.target)
  )
    searchForm.classList.remove("active");
  if (
    sc &&
    shoppingCart &&
    !sc.contains(e.target) &&
    !shoppingCart.contains(e.target)
  )
    shoppingCart.classList.remove("active");
});

window.addEventListener(
  "stock:changed",
  updateShoppingCartVisibilityBasedOnStock,
);

// ── Modal item detail ──
const itemDetailModal = document.querySelector("#item-detail-modal");
const itemDetailButtons = document.querySelectorAll(".item-detail-button");
if (itemDetailModal) {
  itemDetailButtons.forEach((btn) => {
    btn.onclick = (e) => {
      itemDetailModal.style.display = "flex";
      e.preventDefault();
    };
  });
  const closeIcon = document.querySelector(".modal .close-icon");
  if (closeIcon)
    closeIcon.onclick = (e) => {
      itemDetailModal.style.display = "none";
      e.preventDefault();
    };
  window.onclick = (e) => {
    if (e.target === itemDetailModal) itemDetailModal.style.display = "none";
  };
}

// ══════════════════════════════════════════════════════════════
// SISTEM LOGIN & SESSION
// ══════════════════════════════════════════════════════════════

const STORAGE_KEY = "kopi_gans_login";
const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

function getLoginState() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}
function setLoginState(state) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

window.doLogin = function (username, password) {
  if (
    username.trim() === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    setLoginState({ role: "admin", name: "Admin" });
    return true;
  }
  return false;
};

window.__kopi_gans_login_state = getLoginState();

// ══════════════════════════════════════════════════════════════
// DATA: HARGA & STOK (untuk admin panel)
// ══════════════════════════════════════════════════════════════

const CATALOG_KEY = "kopi_gans_catalog";
const PRICES_KEY = "kopi_gans_prices";
const STOCK_KEY = "kopi_gans_stock";

const DEFAULT_CATALOG = [
  /* Biji Kopi */
  { id: 1, name: "Robusta", img: "robusta.png", defaultPrice: 25000, type: "biji" },
  { id: 2, name: "Arabika", img: "arabika.png", defaultPrice: 25000, type: "biji" },
  { id: 3, name: "Decaf", img: "decaf.png", defaultPrice: 35000, type: "biji" },
  { id: 4, name: "Excelsa", img: "excelsa.png", defaultPrice: 35000, type: "biji" },
  { id: 5, name: "Kopi Luwak", img: "kopi-luwak.png", defaultPrice: 20000, type: "biji" },
  { id: 6, name: "Liberika", img: "liberika.png", defaultPrice: 35000, type: "biji" },
  /* Menu Minuman */
  { id: 7, name: "Americano", img: "americano.jpg", defaultPrice: 20000, type: "menu" },
  { id: 8, name: "Cafe Au Lait", img: "cafe-au-lait.jpg", defaultPrice: 23000, type: "menu" },
  { id: 9, name: "Cappuccino", img: "cappuccino.jpg", defaultPrice: 23000, type: "menu" },
  { id: 10, name: "Cold Brew", img: "cold-brew.jpg", defaultPrice: 23000, type: "menu" },
  { id: 11, name: "Espreso", img: "espreso.jpg", defaultPrice: 23000, type: "menu" },
  { id: 12, name: "Flat White", img: "flat-white.jpg", defaultPrice: 23000, type: "menu" },
  { id: 13, name: "Long Black", img: "long-black.jpg", defaultPrice: 23000, type: "menu" },
  { id: 14, name: "Macchiato", img: "macchiato.jpg", defaultPrice: 23000, type: "menu" },
  { id: 15, name: "Mocha", img: "mocha.jpg", defaultPrice: 23000, type: "menu" }
];

window.catalog = (() => {
  try {
    const data = localStorage.getItem(CATALOG_KEY);
    return data ? JSON.parse(data) : DEFAULT_CATALOG;
  } catch {
    return DEFAULT_CATALOG;
  }
})();

window.saveCatalog = (arr) => {
  window.catalog = arr;
  localStorage.setItem(CATALOG_KEY, JSON.stringify(arr));
  window.dispatchEvent(new Event("catalog:changed"));
};

window.prices = (() => {
  try {
    return JSON.parse(localStorage.getItem(PRICES_KEY)) || {};
  } catch {
    return {};
  }
})();
window.stock = (() => {
  try {
    return JSON.parse(localStorage.getItem(STOCK_KEY)) || {};
  } catch {
    return {};
  }
})();

window.savePrices = (obj) =>
  localStorage.setItem(PRICES_KEY, JSON.stringify(obj));
window.saveStock = (obj) =>
  localStorage.setItem(STOCK_KEY, JSON.stringify(obj));

window.updatePrice = (id, value) => {
  window.prices[id] = value;
  window.savePrices(window.prices);
  window.dispatchEvent(new Event("price:changed"));
};
window.adjustProductStock = (id, delta) => {
  window.stock[id] = Math.max(0, Number(window.stock[id] ?? 10) + delta);
  window.saveStock(window.stock);
  window.dispatchEvent(new Event("stock:changed"));
};
window.toggleMenuStockStatus = (id) => {
  window.stock[id] = Number(window.stock[id] ?? 10) > 0 ? 0 : 10;
  window.saveStock(window.stock);
  window.dispatchEvent(new Event("stock:changed"));
};

// ══════════════════════════════════════════════════════════════
// MODAL LOGIN
// ══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  updateShoppingCartVisibilityBasedOnStock();
  setTimeout(updateShoppingCartVisibilityBasedOnStock, 100);
  const modal = document.getElementById("login-modal");
  const overlay = document.getElementById("login-overlay");
  const closeBtn = document.getElementById("login-modal-close");
  const submitBtn = document.getElementById("login-submit");
  const usernameEl = document.getElementById("login-username");
  const passwordEl = document.getElementById("login-password");
  const errorEl = document.getElementById("login-error");
  const adminLink = document.getElementById("admin-nav-link");

  if (!modal) return;

  function openModal() {
    modal.classList.add("show");
    overlay.classList.add("show");
    errorEl.textContent = "";
    usernameEl.value = "";
    passwordEl.value = "";
    usernameEl.focus();
  }

  function closeModal() {
    modal.classList.remove("show");
    overlay.classList.remove("show");
  }

  // Klik ikon kunci → cek session, kalau belum login buka modal
  if (adminLink) {
    adminLink.addEventListener("click", (e) => {
      const state = getLoginState();
      if (state && state.role === "admin") {
        location.href = "admin.html";
      } else {
        e.preventDefault();
        openModal();
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);

  if (submitBtn) submitBtn.addEventListener("click", handleLogin);
  [usernameEl, passwordEl].forEach((el) => {
    if (el)
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleLogin();
      });
  });

  function handleLogin() {
    const u = usernameEl.value.trim();
    const p = passwordEl.value;
    if (!u || !p) {
      errorEl.textContent = "Username dan password wajib diisi.";
      return;
    }
    if (window.doLogin(u, p)) {
      closeModal();
      location.href = "admin.html";
    } else {
      errorEl.textContent = "Username atau password salah.";
      passwordEl.value = "";
      passwordEl.focus();
    }
  }
});

// ══════════════════════════════════════════════════════════════
// ANIMASI: Scroll Reveal (Intersection Observer)
// ══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale"
  );

  if (!revealElements.length) return;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // don't unobserve — keep one-shot reveal
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
});

// ══════════════════════════════════════════════════════════════
// ANIMASI: Navbar Scroll Effect
// ══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  });
});

// ══════════════════════════════════════════════════════════════
// ANIMASI: Hero Particles (Canvas)
// ══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("hero-particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animationId;
  let width, height;

  function resize() {
    const hero = canvas.closest(".hero");
    if (!hero) return;
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity += this.fadeDirection * 0.003;

      if (this.opacity <= 0.05 || this.opacity >= 0.55) {
        this.fadeDirection *= -1;
      }

      if (this.x < -10 || this.x > width + 10 ||
          this.y < -10 || this.y > height + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(182, 137, 91, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 15000), 60);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(182, 137, 91, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  // Only animate when hero is visible
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!animationId) animate();
        } else {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        }
      });
    },
    { threshold: 0.1 }
  );

  resize();
  initParticles();
  heroObserver.observe(canvas.closest(".hero"));

  window.addEventListener("resize", () => {
    resize();
    initParticles();
  });
});

// ══════════════════════════════════════════════════════════════
// ANIMASI: Toast Notification saat Add to Cart
// ══════════════════════════════════════════════════════════════

(function () {
  let toastTimer = null;

  window.showCartToast = function (name) {
    // Remove existing toast
    const existing = document.querySelector(".toast-notification");
    if (existing) existing.remove();
    if (toastTimer) clearTimeout(toastTimer);

    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerHTML = `<span>✅</span> <strong>${name}</strong> ditambahkan ke keranjang`;
    document.body.appendChild(toast);

    toastTimer = setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  // Hook into Alpine cart after Alpine init
  document.addEventListener("alpine:initialized", () => {
    const origAdd = Alpine.store("cart")._addItem;
    if (origAdd) {
      Alpine.store("cart")._addItem = function (item) {
        origAdd.call(this, item);
        window.showCartToast(item.name);
      };
    }
  });
})();
