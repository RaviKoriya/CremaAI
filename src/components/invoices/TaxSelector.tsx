"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTaxRule, INDIA_GST_RATES, UK_VAT_RATES, getIndiaTaxRules } from "@/lib/tax/rules";
import type { TaxRule } from "@/lib/tax/types";

interface TaxSelectorProps {
  country: string;
  onTaxRuleChange: (rule: TaxRule, customRate?: number) => void;
  // India-specific
  gstin?: string;
  onGstinChange?: (value: string) => void;
  // Registration number (VAT, ABN, etc.)
  registrationNumber?: string;
  onRegistrationNumberChange?: (value: string) => void;
}

export function TaxSelector({
  country,
  onTaxRuleChange,
  gstin,
  onGstinChange,
  registrationNumber,
  onRegistrationNumberChange,
}: TaxSelectorProps) {
  const [usStateTaxRate, setUsStateTaxRate] = useState(0);
  const [indiaGstTier, setIndiaGstTier] = useState(3); // Default 18%
  const [indiaInterState, setIndiaInterState] = useState(false);
  const [ukVatRate, setUkVatRate] = useState(20);

  const taxRule = getTaxRule(country);

  useEffect(() => {
    if (country === "IN") {
      const rule = getIndiaTaxRules(indiaInterState);
      const tier = INDIA_GST_RATES[indiaGstTier];
      const ruleWithRate = {
        ...rule,
        rates: indiaInterState
          ? [{ name: "IGST", rate: tier.igst, isCompound: false }]
          : [
              { name: "CGST", rate: tier.cgst, isCompound: false },
              { name: "SGST", rate: tier.sgst, isCompound: false },
            ],
        label: INDIA_GST_RATES[indiaGstTier].label,
      };
      onTaxRuleChange(ruleWithRate);
    } else if (country === "US") {
      onTaxRuleChange(taxRule, usStateTaxRate);
    } else if (country === "GB") {
      const rule = { ...taxRule, rates: [{ name: "VAT", rate: ukVatRate, isCompound: false }] };
      onTaxRuleChange(rule);
    } else {
      onTaxRuleChange(taxRule);
    }
  }, [country, usStateTaxRate, indiaGstTier, indiaInterState, ukVatRate]);

  if (country === "IN") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">GST Rate</Label>
            <Select
              value={String(indiaGstTier)}
              onValueChange={(v) => setIndiaGstTier(Number(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDIA_GST_RATES.map((r, i) => (
                  <SelectItem key={i} value={String(i)}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="interState"
              checked={indiaInterState}
              onChange={(e) => setIndiaInterState(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="interState" className="text-xs cursor-pointer whitespace-nowrap">
              Inter-state (IGST)
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">GSTIN (Seller)</Label>
            <Input
              value={gstin ?? ""}
              onChange={(e) => onGstinChange?.(e.target.value)}
              placeholder="22AAAAA0000A1Z5"
              className="h-9 font-mono text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">HSN/SAC Code</Label>
            <Input
              placeholder="998315"
              className="h-9 font-mono text-xs"
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 px-3 py-2 rounded-lg">
          {indiaInterState
            ? `IGST ${INDIA_GST_RATES[indiaGstTier].igst}% will be applied (inter-state transaction)`
            : `CGST ${INDIA_GST_RATES[indiaGstTier].cgst}% + SGST ${INDIA_GST_RATES[indiaGstTier].sgst}% will be applied (intra-state)`}
        </div>
      </div>
    );
  }

  if (country === "US") {
    return (
      <div className="space-y-2">
        <Label className="text-xs">State Sales Tax Rate (%)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="20"
            step="0.001"
            value={usStateTaxRate}
            onChange={(e) => setUsStateTaxRate(parseFloat(e.target.value) || 0)}
            className="h-9 w-32"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Sales tax rates vary by state and city. Enter the combined rate for the customer&apos;s location.
        </p>
      </div>
    );
  }

  if (country === "GB") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">VAT Rate</Label>
          <Select
            value={String(ukVatRate)}
            onValueChange={(v) => setUkVatRate(Number(v))}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UK_VAT_RATES.map((r) => (
                <SelectItem key={r.rate} value={String(r.rate)}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {taxRule.requiresRegistrationNumber && (
          <div className="space-y-1">
            <Label className="text-xs">{taxRule.registrationLabel}</Label>
            <Input
              value={registrationNumber ?? ""}
              onChange={(e) => onRegistrationNumberChange?.(e.target.value)}
              placeholder="GB123456789"
              className="h-9"
            />
          </div>
        )}
      </div>
    );
  }

  if (taxRule.taxType === "NONE") {
    return (
      <div className="text-sm text-muted-foreground bg-gray-50 px-3 py-2 rounded-lg">
        No tax will be applied for this country.
      </div>
    );
  }

  // Default: show tax label and optional registration number
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
        {taxRule.label} will be applied
        {taxRule.notes && (
          <p className="text-xs text-muted-foreground mt-0.5">{taxRule.notes}</p>
        )}
      </div>
      {taxRule.requiresRegistrationNumber && (
        <div className="space-y-1">
          <Label className="text-xs">{taxRule.registrationLabel}</Label>
          <Input
            value={registrationNumber ?? ""}
            onChange={(e) => onRegistrationNumberChange?.(e.target.value)}
            placeholder={taxRule.registrationLabel}
            className="h-9"
          />
        </div>
      )}
    </div>
  );
}
