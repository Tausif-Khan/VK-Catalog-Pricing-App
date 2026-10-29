import {
  APPLICATIONS,
  CATEGORIES,
  PRODUCTS,
  SOURCES,
  type Application,
  type Category,
  type Product,
  type Source,
} from './catalogue';

export interface CatalogueFilter {
  query?: string;
  category?: Category | 'all';
  application?: Application | 'all';
  source?: Source | 'all';
}

export interface CatalogueMatch {
  product: Product;
  /** Variants visible for this filter — every variant when only the product matches. */
  variantIds: ReadonlySet<string>;
}

const normalize = (value: string): string => value.toLowerCase().trim();

/**
 * Filter the catalogue by free text plus category / application / source facets.
 * A query matches product name, material, category, note, printed page
 * ("page 14") and each variant's label and colour; product-level hits keep all
 * of that product's variants so a result set is never artificially narrowed.
 */
export function filterCatalogue(
  filter: CatalogueFilter = {},
  products: readonly Product[] = PRODUCTS,
): CatalogueMatch[] {
  const query = normalize(filter.query ?? '');
  const category = filter.category ?? 'all';
  const application = filter.application ?? 'all';
  const source = filter.source ?? 'all';

  const matches: CatalogueMatch[] = [];

  for (const product of products) {
    if (category !== 'all' && product.category !== category) continue;
    if (source !== 'all' && product.source !== source) continue;
    if (application !== 'all' && !product.applications.includes(application)) continue;

    const productHit =
      query.length === 0 ||
      normalize(product.name).includes(query) ||
      normalize(product.material).includes(query) ||
      normalize(product.category).includes(query) ||
      normalize(product.note ?? '').includes(query) ||
      (query.startsWith('page ') && product.page === Number(query.slice(5)));

    if (productHit) {
      matches.push({ product, variantIds: new Set(product.variants.map((v) => v.id)) });
      continue;
    }

    const variantIds = new Set(
      product.variants
        .filter(
          (variant) =>
            normalize(variant.label).includes(query) ||
            normalize(variant.colour ?? '').includes(query),
        )
        .map((variant) => variant.id),
    );

    if (variantIds.size > 0) matches.push({ product, variantIds });
  }

  return matches;
}

export function facetOptions<T extends string>(all: readonly T[]): {
  value: T | 'all';
  label: string;
}[] {
  return [
    { value: 'all' as const, label: 'All' },
    ...all.map((value) => ({ value, label: value })),
  ];
}

export const FACETS = { CATEGORIES, APPLICATIONS, SOURCES };