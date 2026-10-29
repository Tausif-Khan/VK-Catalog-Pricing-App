import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PRODUCTS, type Product } from '../lib/catalogue';
import { filterCatalogue } from '../lib/search';
import { diffPrices, formatPrice, type PriceMap } from '../lib/pricing';
import {
  adminLogin,
  deletePrice,
  getAdminStatus,
  savePrice,
  setAdminToken,
} from '../lib/api';

interface Props {
  prices: PriceMap;
  onChanged: () => void;
}

interface Message {
  kind: 'success' | 'error' | 'info';
  text: string;
}

const UNAUTHORIZED = 'Unauthorized';

export function PricingPage({ prices, onChanged }: Props) {
  const [authRequired, setAuthRequired] = useState<boolean | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminStatus()
      .then((status) => {
        if (cancelled) return;
        setAuthRequired(status.authRequired);
        setUnlocked(!status.authRequired);
      })
      .catch(() => {
        if (!cancelled) setAuthRequired(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const matches = useMemo(() => filterCatalogue({ query }), [query]);

  const draftFor = (id: string): string => {
    const draft = drafts[id];
    if (draft !== undefined) return draft;
    const stored = prices[id];
    return stored ? String(stored.value) : '';
  };

  const fail = (err: unknown): void => {
    const text = err instanceof Error ? err.message : 'Something went wrong';
    if (text === UNAUTHORIZED) {
      setAdminToken(null);
      setUnlocked(false);
      setMessage({ kind: 'error', text: 'Session expired — unlock again to keep editing.' });
      return;
    }
    setMessage({ kind: 'error', text });
  };

  const unlock = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const res = await adminLogin(password);
      if (res.ok) {
        setUnlocked(true);
        setPassword('');
        setMessage({ kind: 'success', text: 'Unlocked — you can edit prices.' });
      } else {
        setMessage({ kind: 'error', text: 'Wrong password.' });
      }
    } catch (err) {
      fail(err);
    }
  };

  const saveProduct = async (product: Product): Promise<void> => {
    const ids = product.variants.map((variant) => variant.id);
    const diff = diffPrices(prices, drafts, ids);

    if (diff.invalid.length > 0) {
      setMessage({
        kind: 'error',
        text: `${diff.invalid.length} invalid price(s) in ${product.name} — enter a number from 0 to 1,000,000,000. Nothing was saved.`,
      });
      return;
    }
    if (diff.set.length === 0 && diff.clear.length === 0) {
      setMessage({ kind: 'info', text: `No changes to save for ${product.name}.` });
      return;
    }

    setBusy(true);
    try {
      for (const item of diff.set) await savePrice(item.id, item.value, product.unit);
      for (const id of diff.clear) await deletePrice(id);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const id of ids) delete next[id];
        return next;
      });
      setMessage({
        kind: 'success',
        text: `Saved ${diff.set.length} price(s) for ${product.name}${
          diff.clear.length ? `, cleared ${diff.clear.length}` : ''
        }.`,
      });
      onChanged();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const clearProduct = async (product: Product): Promise<void> => {
    if (confirming !== product.id) {
      setConfirming(product.id);
      return;
    }
    setConfirming(null);

    const ids = product.variants.map((variant) => variant.id).filter((id) => prices[id]);
    if (ids.length === 0) return;

    setBusy(true);
    try {
      for (const id of ids) await deletePrice(id);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const id of ids) delete next[id];
        return next;
      });
      setMessage({ kind: 'success', text: `Cleared ${ids.length} price(s) for ${product.name}.` });
      onChanged();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  if (authRequired && !unlocked) {
    return (
      <div className="mx-auto max-w-sm rounded-lg border border-line bg-white p-6">
        <h1 className="text-base font-semibold text-ink">Pricing (admin)</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Enter the admin password to maintain prices. Viewing the catalogue does not need it.
        </p>
        <form className="mt-4 flex flex-col gap-2" onSubmit={(event) => void unlock(event)}>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin password"
            aria-label="Admin password"
            autoFocus
            className="h-9 rounded-md border border-line bg-white px-3 text-sm"
          />
          <button
            type="submit"
            className="h-9 rounded-md bg-brand text-sm font-medium text-white hover:bg-brand-dark"
          >
            Unlock
          </button>
        </form>
        {message && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {message.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search product or size…"
          aria-label="Search products"
          className="h-8 w-[260px] rounded-md border border-line bg-white px-3 text-sm"
        />
        <span className="text-xs text-ink-faint">
          {Object.keys(prices).length} prices set
          {authRequired ? ' · editing unlocked' : ' · editing is open (set ADMIN_PASSWORD to lock)'}
        </span>
        {message && (
          <span
            role="status"
            className={`ml-auto rounded-md px-2 py-1 text-xs ${
              message.kind === 'error'
                ? 'bg-red-50 text-red-700'
                : message.kind === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-line text-ink-soft'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {matches.map(({ product }) => {
          const priced = product.variants.filter((variant) => prices[variant.id]).length;
          return (
            <section
              key={product.id}
              className="rounded-lg border border-line bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-ink">{product.name}</h2>
                  <p className="text-[11px] text-ink-faint">
                    {product.category} · {product.source} · priced per {product.unit}
                  </p>
                </div>
                <span className="text-xs text-ink-faint">
                  {priced}/{product.variants.length} priced
                </span>
              </div>

              <div className="divide-y divide-line">
                {product.variants.map((variant) => {
                  const stored = prices[variant.id];
                  const raw = draftFor(variant.id);
                  const invalid = raw.trim() !== '' && !/^\d+(\.\d+)?$/.test(raw.trim());
                  return (
                    <div key={variant.id} className="flex items-center gap-3 px-4 py-2">
                      <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                        {variant.colour && <span className="text-ink-faint">{variant.colour} · </span>}
                        {variant.label}
                      </span>
                      <span className="w-28 text-right text-xs text-ink-faint">
                        {stored ? formatPrice(stored) : 'not priced'}
                      </span>
                      <input
                        inputMode="decimal"
                        value={raw}
                        aria-label={`Price for ${product.name} ${variant.label}`}
                        placeholder="e.g. 180"
                        disabled={busy}
                        onChange={(event) =>
                          setDrafts((prev) => ({ ...prev, [variant.id]: event.target.value }))
                        }
                        className={`h-8 w-28 rounded-md border px-2 text-sm disabled:opacity-60 ${
                          invalid ? 'border-red-400 bg-red-50' : 'border-line bg-white'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 border-t border-line px-4 py-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void saveProduct(product)}
                  className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  disabled={busy || priced === 0}
                  onClick={() => void clearProduct(product)}
                  className={`rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 ${
                    confirming === product.id
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-line text-ink-soft hover:bg-line'
                  }`}
                >
                  {confirming === product.id ? 'Click again to confirm' : 'Clear prices'}
                </button>
                <span className="ml-auto text-[11px] text-ink-faint">Blank field = clear</span>
              </div>
            </section>
          );
        })}
        {matches.length === 0 && (
          <p className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-sm text-ink-faint">
            No products match “{query}”.
          </p>
        )}
      </div>

      <p className="mt-4 text-[11px] text-ink-faint">
        Products loaded: {PRODUCTS.length}. Prices are stored in the shared database and appear on
        the Catalogue screen immediately.
      </p>
    </div>
  );
}