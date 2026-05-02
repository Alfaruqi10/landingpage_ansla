"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityPicker({
  value = 1,
  onChange,
  max
}: {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
}) {
  const quantity = value;
  const normalizedMax = typeof max === "number" && max > 0 ? max : undefined;
  const canDecrease = quantity > 1;
  const canIncrease = normalizedMax ? quantity < normalizedMax : true;

  function updateQuantity(nextValue: number) {
    const withMin = Math.max(1, nextValue);
    const clampedValue = normalizedMax ? Math.min(normalizedMax, withMin) : withMin;
    onChange?.(clampedValue);
  }

  return (
    <div className="inline-flex items-center overflow-hidden rounded-[1rem] border border-border/80 bg-[hsl(var(--card)/0.92)]">
      <button
        type="button"
        onClick={() => updateQuantity(quantity - 1)}
        disabled={!canDecrease}
        className="flex h-12 w-12 items-center justify-center text-muted-foreground transition hover:bg-[hsl(var(--accent)/0.8)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
        aria-label="Kurangi jumlah"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="flex h-12 min-w-14 items-center justify-center border-x border-border/80 px-4 text-lg font-medium text-foreground">
        {quantity}
      </div>
      <button
        type="button"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={!canIncrease}
        className="flex h-12 w-12 items-center justify-center text-muted-foreground transition hover:bg-[hsl(var(--accent)/0.8)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
        aria-label="Tambah jumlah"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
