import { Container } from "@/components/container";
import { MockTradeSimulator } from "@/components/mock-trade-simulator";
import { PageIntro } from "@/components/page-intro";
import { getLiveSimTeams } from "@/lib/live-nhl";

const highlights = [
  {
    title: "Vegas-first workflow",
    description:
      "Build from the Golden Knights side first, then work through one opposing front office at a time."
  },
  {
    title: "Live organization depth",
    description:
      "Current NHL rosters, AHL players, prospects, contract structure, and draft picks are all pulled from live public data."
  },
  {
    title: "Lineup after the move",
    description:
      "Once a trade is submitted, the lineup builder reflects the updated VGK roster and eligible call-up pool."
  }
];

export default async function HomePage() {
  const teams = await getLiveSimTeams();

  return (
    <Container className="space-y-16 pb-20 pt-10 md:space-y-20 md:pt-14">
      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="eyebrow">
              <span className="text-gold">Golden Edge Analytics</span> Trade Lab
            </p>
            <h1 className="max-w-4xl font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-6xl">
              Build the trade, read the fallout, then set the VGK lineup that follows.
            </h1>
            <p className="lead max-w-3xl">
              Ever wanted to be Kelly McCrimmon? Ever imagined what it's like to be Bruce Cassidy or John Tortorella after a trade deadline? Well now's your chance. The lab gives you the chance to reshape the Vegas Golden Knights with hyper-realistic logic behind it. Can you build the next Stanley Cup champ?
            </p>
            <p className="max-w-3xl text-sm leading-7 text-mist md:text-base">
              Start with Vegas, choose the other club, stage players or picks from each organization, submit the move,
              and immediately see how it changes the Golden Knights roster, cap picture, and lineup options.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="panel p-5">
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-mist">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-x-10 top-0 h-px ice-stripe" />
          <p className="eyebrow">Platform Focus</p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold text-white">
            One workflow from asset selection to lineup impact.
          </h2>
          <p className="mt-4 text-sm leading-7 text-mist md:text-base">
            The experience is built to mirror the way a Vegas-focused trade conversation actually unfolds:
            identify assets, test the cap implications, submit the deal, then figure out what the roster looks like after it lands.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Live inputs
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                Team rosters, AHL depth, prospect buckets, contract status, clauses, retained salary, and draft-pick pools.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Model layer
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                Trade value, WAR impact, and written takeaways are generated from the simulator model and presented from the Vegas perspective.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="simulator" className="scroll-mt-28 space-y-8">
        <PageIntro
          eyebrow="Simulator"
          title="Start with the move. Then see what it does to Vegas."
          description="The simulator works from live organization data, treats VGK as the home side, applies cap and clause rules, and keeps the lineup builder tied to the post-trade roster state."
        />

        <MockTradeSimulator teams={teams} />
      </section>

      <section id="method" className="grid scroll-mt-28 gap-6 lg:grid-cols-2">
        <div className="panel p-6 md:p-8">
          <p className="eyebrow">Why It Matters</p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold text-white">
            A trade tool that stays tied to roster reality.
          </h2>
          <p className="mt-4 text-sm leading-7 text-mist md:text-base">
            Instead of stopping at a simple asset swap, the product carries the move forward into cap impact,
            organizational depth, lineup decisions, and the practical consequences that follow a Vegas deal.
          </p>
        </div>

        <div className="panel p-6 md:p-8">
          <p className="eyebrow">Model Notes</p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold text-white">
            Live public roster data, model-driven trade evaluation.
          </h2>
          <p className="mt-4 text-sm leading-7 text-mist md:text-base">
            Player, contract, and organization structure are pulled from live public sources. Trade value, WAR-based
            movement, and written summaries are analytical layers inside the simulator rather than official team valuations.
          </p>
        </div>

        <div className="panel p-6 md:col-span-2 md:p-8">
          <p className="eyebrow">How To Read It</p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold text-white">
            A quick guide to the model behind the screen.
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                Contract clauses
              </h3>
              <p className="mt-2 text-sm leading-7 text-mist md:text-base">
                Full no-trade and no-move clauses are treated as hard stops in the simulator. Modified no-trade
                clauses stay available, but they are flagged as a warning because the exact team list is not public.
              </p>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">WAR</h3>
              <p className="mt-2 text-sm leading-7 text-mist md:text-base">
                WAR stands for Wins Above Replacement. In this tool, it helps estimate how much present on-ice value
                a player adds compared with a readily available replacement-level option. If no WAR value is available
                in the source file, that field is left blank rather than guessed.
              </p>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                Trade value
              </h3>
              <p className="mt-2 text-sm leading-7 text-mist md:text-base">
                The value model blends player score inputs, WAR context, age, contract structure, retained salary,
                and draft-pick discounts by round and year. The outcome is meant to suggest whether Vegas is gaining
                present value, future value, flexibility, or some combination of the three in a given move.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
