import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Our Visible Universe" },
      { name: "description", content: "Learn why Our Visible Universe was created." },
      { property: "og:title", content: "About — Our Visible Universe" },
      { property: "og:description", content: "Learn why Our Visible Universe was created." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="About"
      title="A universe made navigable."
      intro="Our Visible Universe turns astronomical knowledge into an explorable place."
    >
      <section>
        <h2>Our purpose</h2>
        <p>
          We want curious people to experience the scale, motion and variety of the cosmos—not only
          read about it. The experience brings together observed objects, measured positions and
          physically inspired visual models.
        </p>
      </section>
      <section>
        <h2>Independent project</h2>
        <p>
          Created and operated by Mukul Srivastava in Chandigarh, India. Questions can be sent to
          ourvisibleuniverse@gmail.com.
        </p>
      </section>
    </InfoPage>
  ),
});
