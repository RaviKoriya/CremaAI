import type { TaxRule } from "./types";

export const TAX_RULES: Record<string, TaxRule> = {
  IN: {
    country: "IN",
    taxType: "GST",
    label: "GST (18%)",
    notes: "CGST 9% + SGST 9% intra-state | IGST 18% inter-state",
    requiresRegistrationNumber: true,
    registrationLabel: "GSTIN",
    rates: [
      { name: "CGST", rate: 9, isCompound: false },
      { name: "SGST", rate: 9, isCompound: false },
    ],
  },
  GB: {
    country: "GB",
    taxType: "VAT",
    label: "VAT (20%)",
    requiresRegistrationNumber: true,
    registrationLabel: "VAT Number",
    rates: [{ name: "VAT", rate: 20, isCompound: false }],
  },
  US: {
    country: "US",
    taxType: "SALES_TAX",
    label: "Sales Tax",
    notes: "Rate varies by state — enter manually",
    rates: [{ name: "Sales Tax", rate: 0, isCompound: false }], // rate set by user
  },
  DE: {
    country: "DE",
    taxType: "VAT",
    label: "MwSt (19%)",
    requiresRegistrationNumber: true,
    registrationLabel: "USt-IdNr.",
    rates: [{ name: "MwSt", rate: 19, isCompound: false }],
  },
  FR: {
    country: "FR",
    taxType: "VAT",
    label: "TVA (20%)",
    requiresRegistrationNumber: true,
    registrationLabel: "No. TVA",
    rates: [{ name: "TVA", rate: 20, isCompound: false }],
  },
  AU: {
    country: "AU",
    taxType: "GST",
    label: "GST (10%)",
    requiresRegistrationNumber: true,
    registrationLabel: "ABN",
    rates: [{ name: "GST", rate: 10, isCompound: false }],
  },
  CA: {
    country: "CA",
    taxType: "VAT",
    label: "GST (5%)",
    notes: "Provincial HST may also apply",
    rates: [{ name: "GST", rate: 5, isCompound: false }],
  },
  SG: {
    country: "SG",
    taxType: "GST",
    label: "GST (9%)",
    requiresRegistrationNumber: true,
    registrationLabel: "GST Reg No.",
    rates: [{ name: "GST", rate: 9, isCompound: false }],
  },
  AE: {
    country: "AE",
    taxType: "VAT",
    label: "VAT (5%)",
    requiresRegistrationNumber: true,
    registrationLabel: "TRN",
    rates: [{ name: "VAT", rate: 5, isCompound: false }],
  },
  NZ: {
    country: "NZ",
    taxType: "GST",
    label: "GST (15%)",
    rates: [{ name: "GST", rate: 15, isCompound: false }],
  },
  NONE: {
    country: "NONE",
    taxType: "NONE",
    label: "No Tax",
    rates: [],
  },
};

export function getTaxRule(country: string): TaxRule {
  return TAX_RULES[country] ?? {
    country,
    taxType: "NONE",
    label: "No Tax",
    rates: [],
  };
}

// India-specific: switch between intra-state (CGST+SGST) and inter-state (IGST)
export function getIndiaTaxRules(isInterState: boolean): TaxRule {
  if (isInterState) {
    return {
      ...TAX_RULES.IN,
      label: "IGST (18%)",
      notes: "Inter-state transaction",
      rates: [{ name: "IGST", rate: 18, isCompound: false }],
    };
  }
  return TAX_RULES.IN;
}

// India GST rates tiers
export const INDIA_GST_RATES = [
  { label: "0% (Exempt)", cgst: 0, sgst: 0, igst: 0 },
  { label: "5% (GST)", cgst: 2.5, sgst: 2.5, igst: 5 },
  { label: "12% (GST)", cgst: 6, sgst: 6, igst: 12 },
  { label: "18% (GST)", cgst: 9, sgst: 9, igst: 18 },
  { label: "28% (GST)", cgst: 14, sgst: 14, igst: 28 },
];

// UK VAT rates
export const UK_VAT_RATES = [
  { label: "Standard (20%)", rate: 20 },
  { label: "Reduced (5%)", rate: 5 },
  { label: "Zero-rated (0%)", rate: 0 },
];
