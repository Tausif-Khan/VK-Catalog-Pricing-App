import { useCallback, useEffect, useState } from 'react';
import { CataloguePage } from './pages/CataloguePage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { getPrices } from './lib/api';
import { PRODUCTS, VARIANT_COUNT } from './lib/catalogue';
import type { PriceMap } from './lib/pricing';

type View = 'catalogue' | 'pricing' | 'about';

const NAV: readonly { id: View; label: string }[] = [
  { id: 'catalogue', label: 'Catalogue' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'about', label: 'Company' },
];

export function App() {
  const [view, setView] = useState<View>('catalogue');
  const [prices, setPrices] = useState<PriceMap>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await getPrices();
      setPrices(res.prices);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load prices');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <img
            src="/vk-logo.png"
            alt="V.K. Synthetics"
            className="h-9 w-auto"
            width={319}
            height={67}
          />
          <nav className="flex gap-1">
            {NAV.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'bg-brand text-white'
                      : 'text-ink-soft hover:bg-line hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {loadError && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {loadError}
          </p>
        )}
        {view === 'catalogue' && <CataloguePage prices={prices} />}
        {view === 'pricing' && <PricingPage prices={prices} onChanged={() => void refresh()} />}
        {view === 'about' && <AboutPage />}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-[11px] text-ink-faint">
        {PRODUCTS.length} product lines · {VARIANT_COUNT} variants · prices maintained by the
        sales team
      </footer>
    </div>
  );
}