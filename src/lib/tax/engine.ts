import type { LineItem, TaxRule, TaxCalculationResult } from "./types";
import { getTaxRule } from "./rules";

export function calculateTax(
  lineItems: LineItem[],
  taxRule: TaxRule,
  customRateOverride?: number, // For US state tax
  discount: number = 0 // flat discount amount
): TaxCalculationResult {
  // Calculate subtotal from all line items
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  // Apply discount
  const discountedSubtotal = Math.max(0, subtotal - discount);

  // Only taxable items contribute to tax
  const taxableSubtotal = lineItems.reduce((sum, item) => {
    if (!item.taxable) return sum;
    return sum + item.quantity * item.unitPrice;
  }, 0);

  // Pro-rate discount across taxable items
  const taxableRatio = subtotal > 0 ? taxableSubtotal / subtotal : 1;
  const discountOnTaxable = discount * taxableRatio;
  const effectiveTaxableAmount = Math.max(0, taxableSubtotal - discountOnTaxable);

  if (taxRule.taxType === "NONE" || taxRule.rates.length === 0) {
    return {
      subtotal,
      discount,
      taxableAmount: effectiveTaxableAmount,
      taxBreakdown: [],
      totalTax: 0,
      total: round(discountedSubtotal),
    };
  }

  // Apply custom override for US state tax
  const effectiveRates =
    customRateOverride !== undefined && taxRule.taxType === "SALES_TAX"
      ? taxRule.rates.map((r) => ({ ...r, rate: customRateOverride }))
      : taxRule.rates;

  let runningBase = effectiveTaxableAmount;
  const taxBreakdown = effectiveRates.map((rate) => {
    const base = rate.isCompound ? runningBase : effectiveTaxableAmount;
    const amount = round((base * rate.rate) / 100);
    if (rate.isCompound) runningBase += amount;
    return { name: rate.name, rate: rate.rate, amount };
  });

  const totalTax = round(taxBreakdown.reduce((sum, t) => sum + t.amount, 0));

  return {
    subtotal,
    discount,
    taxableAmount: effectiveTaxableAmount,
    taxBreakdown,
    totalTax,
    total: round(discountedSubtotal + totalTax),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

// Convenience: calculate from country code
export function calculateTaxByCountry(
  lineItems: LineItem[],
  country: string,
  customRate?: number,
  discount?: number
): TaxCalculationResult {
  const rule = getTaxRule(country);
  return calculateTax(lineItems, rule, customRate, discount);
}

// For live preview updates in the invoice builder
export function recalculate(
  lineItems: LineItem[],
  country: string,
  customRate?: number,
  discountAmount: number = 0
): TaxCalculationResult {
  return calculateTaxByCountry(lineItems, country, customRate, discountAmount);
}
