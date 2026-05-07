function toSafeNumber(value) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateTablePrice(product, selectedTop, selectedLegs) {
  const basePrice = toSafeNumber(product?.basePrice);
  const topPrice = toSafeNumber(selectedTop?.price);
  const legsPrice = toSafeNumber(selectedLegs?.price);

  return basePrice + topPrice + legsPrice;
}

export function formatPrice(value) {
  const safeValue = toSafeNumber(value);

  return `₹${safeValue.toLocaleString("en-IN")}`;
}
