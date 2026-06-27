import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/resources/fundraising-metrics")({
  head: () => ({
    meta: [
      { title: "Essential Nonprofit Fundraising Metrics — A Practical Guide" },
      {
        name: "description",
        content:
          "A practical guide to the nonprofit fundraising metrics that matter most: donor retention, pipeline conversion, and revenue growth — and how to track them.",
      },
      { property: "og:title", content: "Essential Nonprofit Fundraising Metrics — A Practical Guide" },
      {
        property: "og:description",
        content:
          "Understand donor retention, pipeline conversion, and revenue growth — the core metrics behind nonprofit fundraising performance.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://smartsports.lovable.app/resources/fundraising-metrics" },
    ],
    links: [
      { rel: "canonical", href: "https://smartsports.lovable.app/resources/fundraising-metrics" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Essential Nonprofit Fundraising Metrics",
          description:
            "A practical guide to the nonprofit fundraising metrics that matter most: donor retention, pipeline conversion, and revenue growth.",
          author: { "@type": "Organization", name: "SMART Sports" },
          publisher: { "@type": "Organization", name: "SMART Sports" },
          mainEntityOfPage: "https://smartsports.lovable.app/resources/fundraising-metrics",
        }),
      },
    ],
  }),
  component: FundraisingMetricsGuide,
});

function FundraisingMetricsGuide() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <nav className="mb-8 text-sm">
          <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
            ← Back home
          </Link>
        </nav>

        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Resources</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Essential Nonprofit Fundraising Metrics
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The numbers that tell you whether your fundraising is healthy — and what to do when
            they move. A practical reference for nonprofit leaders tracking performance.
          </p>
        </header>

        <div className="space-y-10 text-foreground">
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">Why metrics matter</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Fundraising is easy to feel busy at and hard to measure. A small set of consistent
              metrics turns activity into evidence: where revenue actually comes from, which
              relationships are growing, and where effort is being lost. Track the same handful of
              numbers every month and trends — not anecdotes — start driving decisions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">1. Donor retention rate</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              The share of last year's donors who gave again this year. It is the single best
              indicator of long-term sustainability, because retaining a donor costs far less than
              acquiring a new one.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Formula:</strong> donors who gave both this period
              and last period ÷ donors who gave last period × 100. A retention rate above 60% is
              strong for most organizations; under 40% signals a stewardship problem worth
              addressing before chasing new acquisition.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">2. Pipeline conversion rate</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              How effectively prospects move from identified opportunity to committed gift — across
              major donors, grants, and corporate sponsorships. Tracking conversion by stage shows
              where deals stall.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Formula:</strong> closed-won opportunities ÷ total
              qualified opportunities × 100. Pair it with average gift size and time-in-stage to
              estimate how much pipeline you need to hit a revenue goal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">3. Revenue growth</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Year-over-year change in total revenue raised, ideally broken out by channel (grants,
              major gifts, events, corporate). Channel-level growth reveals which sources are
              compounding and which are flat.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Formula:</strong> (this period revenue − last
              period revenue) ÷ last period revenue × 100. Watch the mix, not just the total: a
              healthy program grows from diversified sources rather than a single windfall.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">Supporting metrics worth watching</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Cost to raise a dollar</strong> — total
                fundraising expense ÷ total revenue raised. Lower is more efficient.
              </li>
              <li>
                <strong className="text-foreground">Average gift size</strong> — total revenue ÷
                number of gifts. Rising values often indicate stronger relationships.
              </li>
              <li>
                <strong className="text-foreground">Donor lifetime value</strong> — projected total
                giving from a donor over the full relationship.
              </li>
              <li>
                <strong className="text-foreground">Grant win rate</strong> — awarded grants ÷
                submitted applications. Helps prioritize funder relationships.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">Putting it together</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              No single metric tells the whole story. Retention shows loyalty, conversion shows
              effectiveness, and revenue growth shows scale. Reviewed together on a regular cadence,
              they give leadership a clear, honest picture of fundraising health — and a shared
              language for where to invest next.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}