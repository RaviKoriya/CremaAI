"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { generateId } from "@/lib/utils";
import type { LineItem } from "@/lib/tax/types";

interface LineItemsEditorProps {
  items: LineItem[];
  currency: string;
  onChange: (items: LineItem[]) => void;
}

export function LineItemsEditor({ items, currency, onChange }: LineItemsEditorProps) {
  function updateItem(id: string, field: keyof LineItem, value: unknown) {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.lineTotal = updated.quantity * updated.unitPrice;
        return updated;
      })
    );
  }

  function addItem() {
    onChange([
      ...items,
      {
        id: generateId(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxable: true,
        lineTotal: 0,
      },
    ]);
  }

  function removeItem(id: string) {
    if (items.length <= 1) return;
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-3">
      {/* Column headers (desktop) */}
      <div className="hidden sm:grid grid-cols-[1fr_72px_108px_72px_36px] gap-2 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Description</span>
        <span className="text-center">Qty</span>
        <span className="text-center">Unit Price</span>
        <span className="text-right">Total</span>
        <span />
      </div>

      {/* Line item rows */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl border bg-muted/30 p-3 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_72px_108px_72px_36px] sm:gap-2 sm:items-center sm:bg-transparent sm:border-0 sm:rounded-none sm:p-1"
          >
            {/* Mobile item label */}
            <div className="flex items-center justify-between sm:hidden">
              <span className="text-xs font-semibold text-muted-foreground">
                Item {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                disabled={items.length <= 1}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Description */}
            <Input
              value={item.description}
              onChange={(e) => updateItem(item.id, "description", e.target.value)}
              placeholder="Description of service or product"
              className="h-10 bg-card text-sm"
            />

            {/* Mobile: qty + price row */}
            <div className="grid grid-cols-2 gap-2 sm:contents">
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                }
                min="0"
                step="1"
                placeholder="Qty"
                className="h-10 bg-card text-sm text-center"
              />
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(e) =>
                  updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                }
                min="0"
                step="0.01"
                placeholder="0.00"
                className="h-10 bg-card text-sm text-right"
              />
            </div>

            {/* Line total + taxable toggle (mobile combined row) */}
            <div className="flex items-center justify-between sm:contents">
              <div className="flex items-center gap-2 sm:hidden">
                <Switch
                  checked={item.taxable}
                  onCheckedChange={(v) => updateItem(item.id, "taxable", v)}
                  className="scale-[0.8]"
                />
                <span className="text-xs text-muted-foreground">Taxable</span>
              </div>
              {/* Desktop: taxable switch (hidden on mobile) */}
              <div className="hidden sm:flex items-center justify-center">
                <Switch
                  checked={item.taxable}
                  onCheckedChange={(v) => updateItem(item.id, "taxable", v)}
                  className="scale-[0.8]"
                />
              </div>

              <span className="font-semibold text-sm text-foreground text-right sm:block">
                {formatCurrency(
                  item.lineTotal ?? item.quantity * item.unitPrice,
                  currency
                )}
              </span>

              {/* Desktop delete button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hidden sm:flex"
                onClick={() => removeItem(item.id)}
                disabled={items.length <= 1}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="gap-1.5 text-accent border-accent/40 hover:bg-accent/10 hover:border-accent"
      >
        <Plus className="w-4 h-4" />
        Add line item
      </Button>
    </div>
  );
}
