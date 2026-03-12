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
        // Recalculate line total
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
    if (items.length <= 1) return; // Keep at least one row
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-2">
      {/* Header row (desktop) */}
      <div className="hidden sm:grid grid-cols-[1fr_80px_100px_80px_80px_40px] gap-2 px-2 text-xs text-muted-foreground font-medium">
        <span>Description</span>
        <span>Qty</span>
        <span>Unit Price</span>
        <span>Taxable</span>
        <span className="text-right">Total</span>
        <span />
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          className="grid grid-cols-1 sm:grid-cols-[1fr_80px_100px_80px_80px_40px] gap-2 p-3 sm:px-2 sm:py-1 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none border sm:border-0 sm:border-b"
        >
          {/* Mobile label */}
          <div className="sm:hidden text-xs text-muted-foreground font-medium">Item {index + 1}</div>

          <div className="sm:hidden grid grid-cols-2 gap-2">
            <Input
              value={item.description}
              onChange={(e) => updateItem(item.id, "description", e.target.value)}
              placeholder="Description"
              className="h-9 col-span-2"
            />
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
              min="0"
              step="1"
              placeholder="Qty"
              className="h-9"
            />
            <Input
              type="number"
              value={item.unitPrice}
              onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              placeholder="Price"
              className="h-9"
            />
            <div className="flex items-center gap-2 col-span-2">
              <Switch
                checked={item.taxable}
                onCheckedChange={(v) => updateItem(item.id, "taxable", v)}
                className="scale-75"
              />
              <span className="text-xs text-muted-foreground">Taxable</span>
              <span className="ml-auto font-semibold text-sm">
                {formatCurrency(item.lineTotal ?? item.quantity * item.unitPrice, currency)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-600"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Desktop layout */}
          <Input
            value={item.description}
            onChange={(e) => updateItem(item.id, "description", e.target.value)}
            placeholder="Description of service/product"
            className="h-8 hidden sm:flex"
          />
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
            className="h-8 hidden sm:flex"
          />
          <Input
            type="number"
            value={item.unitPrice}
            onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="h-8 hidden sm:flex"
          />
          <div className="hidden sm:flex items-center justify-center">
            <Switch
              checked={item.taxable}
              onCheckedChange={(v) => updateItem(item.id, "taxable", v)}
              className="scale-75"
            />
          </div>
          <div className="hidden sm:flex items-center justify-end font-medium text-sm">
            {formatCurrency(item.lineTotal ?? item.quantity * item.unitPrice, currency)}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:text-red-600 hidden sm:flex"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="gap-1.5 text-[#00C9A7] border-[#00C9A7] hover:bg-teal-50"
      >
        <Plus className="w-4 h-4" />
        Add line item
      </Button>
    </div>
  );
}
