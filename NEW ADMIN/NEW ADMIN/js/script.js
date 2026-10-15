// ══════════════════════════════════════════════════════════════
// SCRIPT.JS — Kopi Gans
// UI toggles + sistem login + data harga & stok
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

const PRICES_KEY = "kopi_gans_prices";
const STOCK_KEY = "kopi_gans_stock";

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
