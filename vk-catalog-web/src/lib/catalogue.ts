// Product master data: variant/size detail transcribed from the VK Synthetics
// catalogue PDF (2023-24), categories, materials and source (manufactured vs
// traded) from the company digital brief. Prices are NOT here — they live in
// the D1 database and are fetched from /api/prices.

export type Category = 'Synthetic Yarn & Cord' | 'Tyre Cord' | 'Twine' | 'Rope' | 'Nets';
// The live site splits products three ways: /manufacturing/, /trade/, /import/.
export type Source = 'Manufactured' | 'Traded' | 'Imported';
export type Material = 'Polyester' | 'Nylon' | 'Polypropylene';
export type Application =
  | 'Fishing'
  | 'Agriculture'
  | 'Animal Husbandry'
  | 'Industrial / General'
  | 'Yarn Trading';

export interface Variant {
  /** `${productId}#${variantId}` — the key a price is stored under. */
  id: string;
  label: string;
  colour?: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  source: Source;
  material: Material;
  applications: Application[];
  /** Page in the printed catalogue. */
  page: number;
  /** Pricing unit shown with every price of this product. */
  unit: string;
  /** Open-ended range note when the variant list is not exhaustive. */
  note?: string;
  variants: Variant[];
}

const slug = (value: string): string =>
  value
    .toLowerCase()
    .split('/')
    .join('-')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-');

const fromSizes = (productId: string, sizes: readonly string[]): Variant[] =>
  sizes.map((size) => ({ id: `${productId}#${slug(size)}`, label: size }));

const fromColours = (productId: string, colours: readonly string[]): Variant[] =>
  colours.map((colour) => ({ id: `${productId}#${slug(colour)}`, label: colour, colour }));

const fromColoursAndSpecs = (
  productId: string,
  colours: readonly string[],
  specs: readonly string[],
): Variant[] =>
  colours.flatMap((colour) =>
    specs.map((spec) => ({
      id: `${productId}#${slug(colour)}-${slug(spec)}`,
      label: spec,
      colour,
    })),
  );

const TWINE_SIZES = [
  '1/2',
  '1/4',
  '1/3',
  '2/3',
  '3/3',
  '4/3',
  '5/3',
  '6/3',
  '8/3',
  '10/3',
  '12/3',
  '15/3',
  '18/3',
  '21/3',
  '24/3',
  '30/3',
  '36/3',
  '44/3',
  '48/3',
  '54/3',
  '60/3',
  '72/3',
  '84/3',
  '96/3',
  '120/3',
  '140/3',
] as const;

const TWINEPP_COLOURS = ['Royal Blue', 'Silver', 'Green', 'Yellow', 'Black'] as const;
const COLOURED_NET_COLOURS = ['Green', 'Brown', 'Surmai', 'Chocolate'] as const;

export const PRODUCTS: readonly Product[] = [
  {
    id: 'polyester-twine',
    name: 'Polyester Twine',
    category: 'Twine',
    source: 'Manufactured',
    material: 'Polyester',
    applications: ['Packaging' as Application, 'Industrial / General'],
    page: 6,
    unit: 'kg',
    variants: fromSizes('polyester-twine', TWINE_SIZES),
  },
  {
    id: 'cord-twine',
    name: 'Cord Twine',
    category: 'Twine',
    source: 'Manufactured',
    material: 'Polyester',
    applications: ['Industrial / General'],
    page: 7,
    unit: 'kg',
    variants: fromSizes('cord-twine', [...TWINE_SIZES, '180/3']),
  },
  {
    id: 'twinepp-colour',
    name: 'TwinePP Colour Twine',
    category: 'Twine',
    source: 'Manufactured',
    material: 'Polypropylene',
    applications: ['Packaging' as Application, 'Industrial / General'],
    page: 8,
    unit: 'kg',
    note: 'Catalogue lists sizes "mainly 18/3 and 24/3".',
    variants: fromColoursAndSpecs('twinepp-colour', TWINEPP_COLOURS, ['18/3', '24/3']),
  },
  {
    id: 'polyester-cord-bobbin',
    name: 'Polyester Cord Bobbin',
    category: 'Synthetic Yarn & Cord',
    source: 'Imported',
    material: 'Polyester',
    applications: ['Industrial / General'],
    page: 9,
    unit: 'piece',
    variants: fromSizes('polyester-cord-bobbin', ['1000/2', '1300/2', '1500/2', '2000/2']),
  },
  {
    id: 'nylon-tyre-cord-fabric',
    name: 'Nylon Tyre Cord Fabric',
    category: 'Tyre Cord',
    source: 'Imported',
    material: 'Nylon',
    applications: ['Industrial / General'],
    page: 10,
    unit: 'kg',
    note: 'Catalogue says "in all size" — sizes are not listed individually. Shown under both Import and Trade on vksynthetics.com.',
    variants: fromColours('nylon-tyre-cord-fabric', ['Black', 'Brown']),
  },
  {
    id: 'nylon-tyre-cord-bobbin',
    name: 'Nylon Tyre Cord Bobbin',
    category: 'Tyre Cord',
    source: 'Traded',
    material: 'Nylon',
    applications: ['Industrial / General'],
    page: 11,
    unit: 'piece',
    variants: fromSizes('nylon-tyre-cord-bobbin', ['840/2', '1260/2', '1680/2', '1890/2']),
  },
  {
    // Page number is printed as 11 in the PDF (the catalogue reuses 11 twice).
    id: 'polyester-multi-nets',
    name: 'Polyester Multi Nets (White)',
    category: 'Nets',
    source: 'Manufactured',
    material: 'Polyester',
    applications: ['Agriculture', 'Animal Husbandry'],
    page: 11,
    unit: 'roll',
    variants: fromSizes('polyester-multi-nets', [
      '2x3 / 18 / 600',
      '2x3 / 20 / 600',
      '2x3 / 30 / -',
      '2x3 / 36 / -',
      '2x3 / 40 / -',
      '2x3 / 46 / -',
      '2x3 / 52 / -',
      '2x3 / 63 / -',
    ]),
  },
  {
    id: 'pp-multi-nets',
    name: 'PP Multi Nets',
    category: 'Nets',
    source: 'Manufactured',
    material: 'Polypropylene',
    applications: ['Agriculture', 'Animal Husbandry'],
    page: 13,
    unit: 'roll',
    note: 'White; catalogue notes "(in colours too)".',
    variants: fromSizes('pp-multi-nets', ['18x3 / 90 / 18', '18x3 / 95 / 20', '18x3 / 95 / 22']),
  },
  {
    id: 'polyester-multi-nets-coloured',
    name: 'Polyester Multi Nets (Colour)',
    category: 'Nets',
    source: 'Manufactured',
    material: 'Polyester',
    applications: ['Agriculture', 'Fishing', 'Animal Husbandry'],
    page: 14,
    unit: 'roll',
    note: 'Catalogue says "and many more" — the size list is not exhaustive.',
    variants: fromColoursAndSpecs(
      'polyester-multi-nets-coloured',
      COLOURED_NET_COLOURS,
      ['6x3 / 114 / 35', '6x3 / 100 / 35', '6x3 / 87 / 35', '8x3 / 114 / 21'],
    ),
  },
  {
    id: 'tyre-cord-nets',
    name: 'Tyre Cord Nets',
    category: 'Nets',
    source: 'Manufactured',
    material: 'Nylon',
    applications: ['Fishing', 'Agriculture'],
    page: 15,
    unit: 'roll',
    note: 'Catalogue says "any mesh size" in these three base sizes.',
    variants: fromSizes('tyre-cord-nets', ['840/2', '1260/2', '1680/2']),
  },
  {
    id: 'braided-ropes-dori',
    name: 'Braided Ropes (Dori)',
    category: 'Rope',
    source: 'Manufactured',
    material: 'Polyester',
    applications: ['Industrial / General', 'Fishing'],
    page: 16,
    unit: 'kg',
    variants: fromSizes('braided-ropes-dori', ['3mm', '4mm', '5mm']),
  },
];

export const CATEGORIES: readonly Category[] = [
  'Twine',
  'Rope',
  'Nets',
  'Tyre Cord',
  'Synthetic Yarn & Cord',
];

export const APPLICATIONS: readonly Application[] = [
  'Fishing',
  'Agriculture',
  'Animal Husbandry',
  'Industrial / General',
  'Yarn Trading',
];

export const SOURCES: readonly Source[] = ['Manufactured', 'Traded', 'Imported'];

export const VARIANT_COUNT: number = PRODUCTS.reduce(
  (sum, product) => sum + product.variants.length,
  0,
);