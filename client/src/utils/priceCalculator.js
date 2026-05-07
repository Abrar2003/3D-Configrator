// src/utils/priceCalculator.js

export function calculateTablePrice(product, selectedTop, selectedLegs) {
  const basePrice = Number(product?.basePrice || 0);
  const topPrice = Number(selectedTop?.price || 0);
  const legsPrice = Number(selectedLegs?.price || 0);

  return basePrice + topPrice + legsPrice;
}