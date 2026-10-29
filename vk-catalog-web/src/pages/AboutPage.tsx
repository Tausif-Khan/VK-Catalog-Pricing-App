export function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-ink">About V.K. Synthetics</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Importers, traders &amp; manufacturers of synthetic yarn, tyre cord fabrics, braided rope,
          fishnet twine and fishing nets — under the Veekeylon brand.
        </p>
      </header>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">Company background</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The business began with our father, <strong>Mr. Hafizullah Khan</strong>, in the trade and
          dealership of synthetic yarn and yarn waste in the <strong>early eighties</strong>.{' '}
          <strong>V.K. Synthetics</strong> was registered in <strong>2000</strong> as a firm
          dealing in fishing requisites, which gradually specialised into importers, traders and
          manufacturers of synthetic yarn, yarn waste, tyre cord, tyre cord fabrics, braided rope,
          fishnet twine and fishing nets.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Warehouses and manufacturing units sit in <strong>Bhiwandi, Thane district,
          Maharashtra</strong>, with the commercial office in Mumbai. Every product leaves packed
          and delivered under the registered <strong>Veekeylon</strong> brand.
        </p>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">Mission, vision &amp; values</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          <strong>Mission:</strong> keep delivering high-quality synthetic-yarn products with
          integrity and complete customer satisfaction, through continuous improvement, innovation
          and technology.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          <strong>Vision:</strong> perpetuate a heritage rooted in the synthetic yarn industry and
          attain leadership in it, globally.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            'Honesty & integrity',
            'High-quality, cost-effective production',
            'Timely execution',
            'Teamwork',
            'Innovation',
          ].map((value) => (
            <span
              key={value}
              className="rounded-md border border-line bg-line px-2 py-1 text-xs text-ink-soft"
            >
              {value}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">How we work</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          We are an industrial materials and products supplier, not a consumer shop: work runs
          source / import → trade → manufacture → stock → supply to B2B customers, and most
          business is <strong>quotation and enquiry driven</strong> rather than fixed-price retail.
        </p>
        <ol className="mt-3 grid gap-1.5 text-sm text-ink-soft sm:grid-cols-2">
          {[
            'Customer requirement',
            'Product / specification enquiry',
            'Availability & sourcing check',
            'Price quotation',
            'Negotiation',
            'Order',
            'Production or stock allocation',
            'Dispatch',
          ].map((step, index) => (
            <li key={step} className="rounded bg-line px-2 py-1.5">
              <span className="mr-2 text-ink-faint">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">
          Made, traded &amp; imported — how we source
        </h2>
        <p className="mt-1 text-[11px] text-ink-faint">
          The same three-way split as the product pages on vksynthetics.com; every product in the
          catalogue carries one of these badges.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Manufacturing
            </p>
            <ul className="mt-1.5 space-y-1 text-sm text-ink-soft">
              <li>Dyed fishnets (polyester cord &amp; twine)</li>
              <li>Fishnet of nylon tyre cord</li>
              <li>Twines — nylon, polyester, dyed PP</li>
              <li>Braided rope / parachute dori</li>
              <li>Double-twist twine of polyester cord</li>
              <li>Agriculture &amp; animal-husbandry nets</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Trade</p>
            <ul className="mt-1.5 space-y-1 text-sm text-ink-soft">
              <li>Tyre cord fabric rolls &amp; cut-pieces</li>
              <li>Tyre cord on bobbin</li>
              <li>Nylon / polyester cord &amp; twine</li>
              <li>Fishnets &amp; braided rope</li>
              <li>Yarn &amp; cord waste</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand">Import</p>
            <ul className="mt-1.5 space-y-1 text-sm text-ink-soft">
              <li>Tyre cord fabric (grey / black, roll &amp; cut-piece)</li>
              <li>Nylon &amp; polyester filament yarn</li>
              <li>PP dyed filament yarn</li>
              <li>Nylon / polyester cord on bobbin</li>
              <li>Cord waste</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">Markets we serve</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            'Fishing',
            'Agriculture',
            'Animal husbandry',
            'Industrial & general utility',
            'Material / yarn trading',
          ].map((market) => (
            <span
              key={market}
              className="rounded-md border border-line bg-line px-2 py-1 text-xs text-ink-soft"
            >
              {market}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">People &amp; contact</h2>
        <div className="mt-2 grid gap-4 text-sm text-ink-soft sm:grid-cols-2">
          <div>
            <p className="font-medium text-ink">Mr. Vasiullah Khan</p>
            <p className="text-xs text-ink-faint">Sales &amp; marketing</p>
            <p className="mt-3 font-medium text-ink">Mr. Ubaidullah Khan</p>
            <p className="text-xs text-ink-faint">Import &amp; production</p>
          </div>
          <div>
            <p className="font-medium text-ink">V K Synthetics</p>
            <p>
              Shop No. 1, Vidya Bhavan, 4 Janjiker Street, Masjid Bunder (West), Mumbai 400003
            </p>
            <p className="mt-1">
              <a
                href="mailto:vksynthetics@yahoo.com"
                className="text-brand underline underline-offset-2"
              >
                vksynthetics@yahoo.com
              </a>
            </p>
            <p>
              <a href="tel:02240065737" className="text-brand underline underline-offset-2">
                022-4006 5737
              </a>
              <span className="text-ink-faint"> · </span>
              +91 9322594975
              <span className="text-ink-faint"> · </span>
              +91 9769622971
            </p>
            <p className="mt-1 text-xs text-ink-faint">
              GST 27AFYPK7455G1ZQ · Instagram @VKSYNTHETICS
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
