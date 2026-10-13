import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Our Visible Universe" },
      { name: "description", content: "Contact Our Visible Universe support." },
      { property: "og:title", content: "Contact — Our Visible Universe" },
      { property: "og:description", content: "Contact Our Visible Universe support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Contact"
      title="We’re here to help."
      intro="For account, access or product questions, contact our support address."
    >
      <section>
        <h2>Email</h2>
        <p>
          <a href="mailto:ourvisibleuniverse@gmail.com" className="text-primary underline">
            ourvisibleuniverse@gmail.com
          </a>
        </p>
      </section>
      <section>
        <h2>Location</h2>
        <p>Chandigarh, India</p>
      </section>
      <section>
        <h2>Response information</h2>
        <p>
          Include the email address connected to your account, but never send passwords, full
          payment details or bank information.
        </p>
      </section>
    </InfoPage>
  ),
});
