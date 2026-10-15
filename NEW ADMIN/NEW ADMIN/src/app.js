// ══════════════════════════════════════════════════════════════
// APP.JS — Kopi Gans
// Data produk, menu minuman, dan Alpine store cart
// ══════════════════════════════════════════════════════════════

// Konversi ke format Rupiah
window.rupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);

function slugifyMenuName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSoldMenuImagePath(item) {
  const slug = slugifyMenuName(item.name || item.img || "");
  const aliasMap = {
    americano: "sold-amerikano.png",
    "cafe-au-lait": "sold-cafe-au-lait.png",
    cappuccino: "sold-cappuccino.png",
    "cold-brew": "sold-cold-brew.png",
    espresso: "sold-espreso.png",
    "flat-white": "sold-flat-white.png",
    "long-black": "sold-long-black.png",
    macchiato: "sold-macchiato.png",
    mocha: "sold-mocha.png",
  };

  return `img/menu-sold/${aliasMap[slug] || `sold-${slug}.png`}`;
}

function getMenuImagePath(item, stockOverride) {
  const isMenuItem =
    item?.source === "menu" ||
    (typeof item?.id === "number" && item.id >= 7 && item.id <= 15);
  const stock = Number(stockOverride ?? window.stock?.[item.id] ?? 10);

  if (isMenuItem && stock <= 0) {
    return getSoldMenuImagePath(item);
  }

  return isMenuItem
    ? `img/menu/${item.img}`
    : `img/products/${item.img}`;
}

window.getMenuImagePath = getMenuImagePath;

document.addEventListener("alpine:init", () => {
  // ── Data Produk Biji Kopi ──────────────────────────────────
  Alpine.data("products", () => ({
    prices: window.prices || {},
    items: [
      { id: 1, name: "Robusta", img: "robusta.png", price: 25000, stock: 12 },
      { id: 2, name: "Arabika", img: "arabika.png", price: 25000, stock: 10 },
      { id: 3, name: "Decaf", img: "decaf.png", price: 35000, stock: 8 },
      { id: 4, name: "Excelsa", img: "excelsa.png", price: 35000, stock: 6 },
      {id: 5, name: "Kopi Luwak", img: "kipi-luwak.png", price: 20000, stock: 4,},
      { id: 6, name: "Liberika", img: "liberika.png", price: 35000, stock: 9 },
    ],

    init() {
      window.addEventListener("price:changed", () => {
        this.prices = { ...window.prices };
      });
    },

    getPrice(id, defaultPrice = 0) {
      return Number(this.prices[id] ?? defaultPrice);
    },

    getStock(id, defaultStock = 10) {
      return Number(window.stock?.[id] ?? defaultStock);
    },
  }));

  // ── Data Menu Minuman ──────────────────────────────────────
  Alpine.data("menuSection", () => ({
    prices: window.prices || {},
    stockState: window.stock || {},
    menuItems: [
      {id: 7, name: "Americano", img: "americano.jpg", price: 20000,},
      {id: 8, name: "Cafe Au Lait", img: "cafe-au-lait.jpg", price: 23000,},
      {id: 9, name: "Cappuccino", img: "cappuccino.jpg", price: 23000,},
      {id: 10, name: "Cold Brew", img: "cold-brew.jpg", price: 23000,},
      {id: 11, name: "Espresso", img: "espreso.jpg", price: 23000 },
      {id: 12, name: "Flat White", img: "flat-white.jpg", price: 23000,},
      {id: 13, name: "Long Black", img: "long-black.jpg", price: 23000,},
      {id: 14, name: "Macchiato", img: "macchiato.jpg", price: 23000,},
      {id: 15, name: "Mocha", img: "mocha.jpg", price: 23000 },
    ],

    init() {
      window.addEventListener("price:changed", () => {
        this.prices = { ...window.prices };
      });
      window.addEventListener("stock:changed", () => {
        this.stockState = { ...window.stock };
      });
    },

    getPrice(id, defaultPrice = 0) {
      return Number(this.prices[id] ?? defaultPrice);
    },

    getStock(id, defaultStock = 10) {
      return Number(this.stockState[id] ?? defaultStock);
    },

    getMenuImage(item) {
      return getMenuImagePath(item, this.getStock(item.id, 10));
    },
  }));

  // ── Cart Store ─────────────────────────────────────────────
  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,

    // Tambah produk biji kopi (source: 'product')
    add(newItem) {
      this._addItem({ ...newItem, source: "product" });
    },

    // Tambah menu minuman (source: 'menu')
    addMenu(newItem) {
      this._addItem({ ...newItem, source: "menu" });
    },

    // Internal: tambah item, gabung jika sudah ada
    _addItem(item) {
      const key = `${item.id}-${item.source}`;
      const existing = this.items.find((i) => `${i.id}-${i.source}` === key);
      if (existing) {
        existing.qty++;
      } else {
        this.items.push({ ...item, qty: 1 });
      }
      this.quantity++;
      this.total += item.price;
    },

    increment(id, source) {
      const key = `${id}-${source}`;
      const item = this.items.find((i) => `${i.id}-${i.source}` === key);
      if (!item) return;
      item.qty++;
      this.quantity++;
      this.total += item.price;
    },

    decrement(id, source) {
      const key = `${id}-${source}`;
      const idx = this.items.findIndex((i) => `${i.id}-${i.source}` === key);
      if (idx === -1) return;
      const item = this.items[idx];
      item.qty -= 1;
      this.quantity -= 1;
      this.total -= item.price;
      if (item.qty <= 0) {
        this.items.splice(idx, 1);
      }
    },

    // Hapus item dari cart
    remove(id, source) {
      const key = `${id}-${source}`;
      const idx = this.items.findIndex((i) => `${i.id}-${i.source}` === key);
      if (idx === -1) return;
      const item = this.items[idx];
      this.total -= item.price * item.qty;
      this.quantity -= item.qty;
      this.items.splice(idx, 1);
    },

    // Kosongkan semua
    clear() {
      this.items = [];
      this.total = 0;
      this.quantity = 0;
    },
  });
});
