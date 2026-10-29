import { describe, expect, it } from 'vitest';
import { PRODUCTS, VARIANT_COUNT } from '../catalogue';
import { filterCatalogue } from '../search';

describe('filterCatalogue', () => {
  it('returns every product and variant for an empty filter', () => {
    const matches = filterCatalogue();
    expect(matches).toHaveLength(PRODUCTS.length);
    const shown = matches.reduce((sum, match) => sum + match.variantIds.size, 0);
    expect(shown).toBe(VARIANT_COUNT);
  });

  it('filters by category', () => {
    const matches = filterCatalogue({ category: 'Nets' });
    expect(matches.map((m) => m.product.id)).toEqual([
      'polyester-multi-nets',
      'pp-multi-nets',
      'polyester-multi-nets-coloured',
      'tyre-cord-nets',
    ]);
  });

  it('splits products by manufactured / traded / imported source', () => {
    const traded = filterCatalogue({ source: 'Traded' });
    expect(traded.map((m) => m.product.id)).toEqual(['nylon-tyre-cord-bobbin']);

    const imported = filterCatalogue({ source: 'Imported' });
    expect(imported.map((m) => m.product.id)).toEqual([
      'polyester-cord-bobbin',
      'nylon-tyre-cord-fabric',
    ]);

    const made = filterCatalogue({ source: 'Manufactured' });
    expect(made).toHaveLength(8);
    expect(made.every((m) => m.product.source === 'Manufactured')).toBe(true);
  });

  it('filters by application', () => {
    const fishing = filterCatalogue({ application: 'Fishing' });
    expect(fishing.map((m) => m.product.id)).toEqual([
      'polyester-multi-nets-coloured',
      'tyre-cord-nets',
      'braided-ropes-dori',
    ]);
  });

  it('keeps all variants when the product matches', () => {
    const [match] = filterCatalogue({ query: 'dori' });
    expect(match?.product.id).toBe('braided-ropes-dori');
    expect(match?.variantIds.size).toBe(3);
  });

  it('narrows to the matching variant when only a size matches', () => {
    const [match] = filterCatalogue({ query: '180/3' });
    expect(match?.product.id).toBe('cord-twine');
    expect(match ? [...match.variantIds] : []).toEqual(['cord-twine#180-3']);
  });

  it('matches variants by colour', () => {
    const matches = filterCatalogue({ query: 'black' });
    const ids = new Set(matches.flatMap((m) => [...m.variantIds]));
    expect(ids.has('nylon-tyre-cord-fabric#black')).toBe(true);
    expect(ids.has('twinepp-colour#black-18-3')).toBe(true);
  });

  it('matches material', () => {
    const matches = filterCatalogue({ query: 'polypropylene' });
    expect(matches.every((m) => m.product.material === 'Polypropylene')).toBe(true);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('matches a printed page number', () => {
    const matches = filterCatalogue({ query: 'page 14' });
    expect(matches.map((m) => m.product.id)).toEqual(['polyester-multi-nets-coloured']);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterCatalogue({ query: 'zzz-not-a-product' })).toEqual([]);
    expect(filterCatalogue({ query: 'twine', category: 'Rope' })).toEqual([]);
  });
});