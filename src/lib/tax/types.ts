export type TaxType = "GST" | "VAT" | "SALES_TAX" | "NONE";

export interface TaxRate {
  name: string;
  rate: number; // percentage, e.g. 9 = 9%
  isCompound: boolean; // applies on top of previous taxes
}

export interface TaxRule {
  country: string;
  taxType: TaxType;
  rates: TaxRate[];
  label: string; // displayed in UI, e.g. "GST (18%)"
  notes?: string;
  requiresRegistrationNumber?: boolean; // e.g. GSTIN for India, VAT number for EU
  registrationLabel?: string; // "GSTIN", "VAT Number", etc.
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  lineTotal?: number;
  // Optional fields for India
  hsnSacCode?: string;
}

export interface TaxBreakdownItem {
  name: string;
  rate: number;
  amount: number;
}

export interface TaxCalculationResult {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  taxBreakdown: TaxBreakdownItem[];
  totalTax: number;
  total: number;
}
