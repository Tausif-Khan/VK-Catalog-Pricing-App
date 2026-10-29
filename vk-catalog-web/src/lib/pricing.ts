export interface Price {
  value: number;
  unit: string;
}

export type PriceMap = Record<string, Price>;

export const MAX_PRICE = 1_000_000_000;

/** Blank input means "clear the price"; otherwise must parse to a valid number. */
export function parsePriceInput(raw: string): number | null {
  const cleaned = raw.trim().split(',').join('');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0 || value > MAX_PRICE) return null;
  return value;
}

export function formatPrice(price: Price): string {
  const value = Number.isInteger(price.value) ? String(price.value) : price.value.toFixed(2);
  return `₹${value}/${price.unit}`;
}

export interface PriceDiff {
  /** Variant ids to write, with their parsed value. */
  set: { id: string; value: number }[];
  /** Variant ids to delete (field left blank). */
  clear: string[];
  /** Variant ids whose input is not a valid price — nothing is written for them. */
  invalid: string[];
}

/**
 * Compare raw form inputs against stored prices for one product's variants.
 * Only fields the user actually edited are considered; a variant whose parsed
 * value equals what is stored is not written again.
 */
export function diffPrices(
  stored: PriceMap,
  drafts: Readonly<Record<string, string>>,
  variantIds: readonly string[],
): PriceDiff {
  const diff: PriceDiff = { set: [], clear: [], invalid: [] };

  for (const id of variantIds) {
    const draft = drafts[id];
    if (draft === undefined) continue;

    const raw = draft.trim();
    const existing = stored[id];

    if (raw === '') {
      if (existing) diff.clear.push(id);
      continue;
    }

    const parsed = parsePriceInput(raw);
    if (parsed === null) {
      diff.invalid.push(id);
      continue;
    }

    if (existing && existing.value === parsed) continue;
    diff.set.push({ id, value: parsed });
  }

  return diff;
}
