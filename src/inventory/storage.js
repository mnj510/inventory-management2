// Simple LocalStorage-based inventory utilities

const PRODUCTS_KEY = "inventory.products";
const TRANSACTIONS_KEY = "inventory.transactions";
const TODAY_SHIP_LIST_KEY = "inventory.todayShipList";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProducts() {
  return parseStorage(PRODUCTS_KEY, []);
}

export function saveProducts(products) {
  saveStorage(PRODUCTS_KEY, products);
}

export function findProductByBarcode(barcode) {
  if (!barcode) return undefined;
  const products = getProducts();
  return products.find((p) => p.barcode === String(barcode));
}

export function upsertProduct({ barcode, name }) {
  const normalizedBarcode = String(barcode).trim();
  const products = getProducts();
  const existing = products.find((p) => p.barcode === normalizedBarcode);
  if (existing) {
    if (name && existing.name !== name) {
      existing.name = name;
      saveProducts([...products]);
    }
    return existing;
  }
  const newProduct = {
    id: generateId(),
    barcode: normalizedBarcode,
    name: name || normalizedBarcode,
    stock: 0,
    createdAt: new Date().toISOString(),
  };
  saveProducts([newProduct, ...products]);
  return newProduct;
}

export function getTransactions() {
  return parseStorage(TRANSACTIONS_KEY, []);
}

export function saveTransactions(transactions) {
  saveStorage(TRANSACTIONS_KEY, transactions);
}

export function logTransaction({ type, productId, barcode, name, quantity, dateISO }) {
  const transactions = getTransactions();
  const item = {
    id: generateId(),
    type, // 'IN' | 'OUT'
    productId,
    barcode,
    name,
    quantity,
    dateISO: dateISO || new Date().toISOString(),
    loggedAt: new Date().toISOString(),
  };
  saveTransactions([item, ...transactions]);
  return item;
}

export function addStock(productId, quantity, dateISO) {
  const products = getProducts();
  const target = products.find((p) => p.id === productId);
  if (!target) return;
  const safeQty = Math.max(0, Number(quantity) || 0);
  target.stock = Math.max(0, (Number(target.stock) || 0) + safeQty);
  saveProducts([...products]);
  logTransaction({
    type: "IN",
    productId: target.id,
    barcode: target.barcode,
    name: target.name,
    quantity: safeQty,
    dateISO,
  });
}

export function deductStock(productId, quantity, dateISO) {
  const products = getProducts();
  const target = products.find((p) => p.id === productId);
  if (!target) return;
  const safeQty = Math.max(0, Number(quantity) || 0);
  target.stock = Math.max(0, (Number(target.stock) || 0) - safeQty);
  saveProducts([...products]);
  logTransaction({
    type: "OUT",
    productId: target.id,
    barcode: target.barcode,
    name: target.name,
    quantity: safeQty,
    dateISO,
  });
}

export function getTodayShipList() {
  return parseStorage(TODAY_SHIP_LIST_KEY, []);
}

export function saveTodayShipList(list) {
  saveStorage(TODAY_SHIP_LIST_KEY, list);
}

export function addToTodayShipList(barcode, delta = 1) {
  const product = findProductByBarcode(barcode);
  if (!product) return;
  const list = getTodayShipList();
  const existing = list.find((i) => i.productId === product.id);
  if (existing) {
    existing.quantity = Math.max(0, (Number(existing.quantity) || 0) + Number(delta || 0));
    saveTodayShipList([...list]);
    return existing;
  }
  const item = {
    productId: product.id,
    barcode: product.barcode,
    name: product.name,
    quantity: Math.max(0, Number(delta || 0) || 1),
    addedAt: new Date().toISOString(),
  };
  saveTodayShipList([item, ...list]);
  return item;
}

export function setShipItemQuantity(productId, newQuantity) {
  const list = getTodayShipList();
  const target = list.find((i) => i.productId === productId);
  if (!target) return;
  target.quantity = Math.max(0, Number(newQuantity) || 0);
  saveTodayShipList([...list]);
}

export function removeFromTodayShipList(productId) {
  const list = getTodayShipList();
  saveTodayShipList(list.filter((i) => i.productId !== productId));
}

export function processShipment(dateISO) {
  const list = getTodayShipList();
  for (const item of list) {
    if (item.quantity > 0) {
      deductStock(item.productId, item.quantity, dateISO);
    }
  }
  saveTodayShipList([]);
  return list;
}


