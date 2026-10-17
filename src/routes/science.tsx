import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "Scientific content — Our Visible Universe" },
      {
        name: "description",
        content:
          "How astronomical evidence informs the interactive universe and its educational explanations.",
      },
      { property: "og:title", content: "Scientific content — Our Visible Universe" },
      {
        property: "og:description",
        content:
          "How astronomical evidence informs the interactive universe and its educational explanations.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Scientific content"
      title="Inspired by observation. Clear about models."
      intro="The universe combines catalogued measurements with visual models where direct observation is incomplete."
    >
      <section>
        <h2>Measured foundations</h2>
        <p>
          Positions, distances, classifications and important physical properties are based on
          established astronomical catalogues and mission results where available. Object
          information helps learners compare scale, light-travel time, temperature, mass and other
          defining characteristics.
        </p>
      </section>
      <section>
        <h2>Solar and planetary learning</h2>
        <p>
          Planet and moon motion introduces orbital relationships, while close viewing supports
          comparison of rocky worlds, gas giants, ring systems and confirmed or modelled exoplanets.
        </p>
      </section>
      <section>
        <h2>Stellar and galactic learning</h2>
        <p>
          Spectral classes, stellar lifetimes and unusual stars show how stars differ and evolve.
          Galaxy views connect morphology, rotation and hosted star systems to the larger structure
          of the observable cosmos.
        </p>
      </section>
      <section>
        <h2>Extreme-object learning</h2>
        <p>
          Black holes, quasars, pulsars and accretion structures are presented with object-specific
          explanations. Their visuals are interpretive models of physical processes, not direct
          photographs.
        </p>
      </section>
      <section>
        <h2>Responsible visualization</h2>
        <p>
          Space contains scales and brightness differences that cannot be shown literally on one
          screen. Presentation magnification and procedural detail are used to keep important
          objects visible while preserving their relationships.
        </p>
      </section>
      <section>
        <h2>Modelled systems</h2>
        <p>
          When no confirmed planetary system is available, a hosted system may be marked as
          modelled. It exists to support exploration and is not presented as a confirmed discovery.
        </p>
      </section>
      <section>
        <h2>Cosmic Evolution: Observed Evidence vs. Simulation</h2>
        <p>
          Our Cosmic Evolution experience strictly separates observational empirical evidence (such
          as the 2.7255 K Cosmic Microwave Background blackbody spectrum, BBN primordial light
          element abundances, and JWST high-redshift galaxy spectra) from numerical simulations
          (such as IllustrisTNG cosmological box snapshots). The Big Bang is explicitly modeled as
          the metric expansion of space itself according to General Relativity, never as an
          explosion into pre-existing space.
        </p>
      </section>
    </InfoPage>
  ),
});
