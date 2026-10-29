import { useMemo, useState } from 'react';
import { CATEGORIES, SOURCES, type Category, type Source } from '../lib/catalogue';
import { filterCatalogue } from '../lib/search';
import { formatPrice, type PriceMap } from '../lib/pricing';

interface Props {
  prices: PriceMap;
}

interface FacetProps {
  label: string;
  value: string;
  allLabel: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function Facet({ label, value, allLabel, options, onChange }: FacetProps) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-md border border-line bg-white px-2 text-sm text-ink-soft"
    >
      <option value="all">{allLabel}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function SourceBadge({ source }: { source: Source }) {
  const classes =
    source === 'Manufactured'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : source === 'Imported'
        ? 'bg-sky-50 text-brand border-sky-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${classes}`}>
      {source}
    </span>
  );
}

export function CataloguePage({ prices }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [source, setSource] = useState<Source | 'all'>('all');

  const matches = useMemo(
    () => filterCatalogue({ query, category, source }),
    [query, category, source],
  );

  const pricedCount = Object.keys(prices).length;

  return (
    <div>
      {/* Compact section header in place of the old image banner. */}
      <section className="mb-4 border-b border-line pb-3">
        <h1 className="text-base font-bold text-ink">Product Catalogue</h1>
        <p className="mt-0.5 text-xs text-ink-soft">
          Search by size, colour, material or product.
        </p>
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search size (18/3), colour, material, product…"
          aria-label="Search the catalogue"
          className="h-8 w-[280px] rounded-md border border-line bg-white px-3 text-sm"
        />
        <Facet
          label="Category"
          value={category}
          allLabel="All categories"
          options={CATEGORIES}
          onChange={(value) => setCategory(value as Category | 'all')}
        />
        <Facet
          label="Source"
          value={source}
          allLabel="Any source"
          options={SOURCES}
          onChange={(value) => setSource(value as Source | 'all')}
        />
        <span className="ml-auto text-xs text-ink-faint">
          {matches.length} products · {pricedCount} prices set
        </span>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center">
          <p className="text-sm font-medium text-ink-soft">No matches</p>
          <p className="mt-1 text-sm text-ink-faint">
            Nothing matches “{query}” with these filters. Try a size like 18/3, a colour, or clear
            a filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {matches.map(({ product, variantIds }) => {
            const visible = product.variants.filter((variant) => variantIds.has(variant.id));
            const priced = product.variants.filter((variant) => prices[variant.id]).length;
            return (
              <article
                key={product.id}
                className="rounded-lg border border-line bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-ink">{product.name}</h2>
                    <p className="mt-0.5 text-[11px] text-ink-faint">
                      {product.category} · {product.material} · per {product.unit}
                    </p>
                  </div>
                  <SourceBadge source={product.source} />
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded bg-line px-1.5 py-0.5 text-[10px] text-ink-soft">
                    {priced}/{product.variants.length} priced
                  </span>
                </div>

                {product.note && (
                  <p className="mt-2 text-[11px] text-amber-700">{product.note}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {visible.map((variant) => {
                    const price = prices[variant.id];
                    return (
                      <span
                        key={variant.id}
                        className="rounded-md border border-line bg-line px-2 py-1 text-[11px] text-ink-soft"
                      >
                        {variant.colour && <span className="text-ink-faint">{variant.colour} · </span>}
                        {variant.label}
                        {price && (
                          <span className="ml-1.5 font-medium text-brand">
                            {formatPrice(price)}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}