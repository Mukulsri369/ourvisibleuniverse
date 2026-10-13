import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const faqs = [
  [
    "Is this a recurring subscription?",
    "No. Each pass is a one-time payment for 30, 180 or 365 days with no automatic renewal.",
  ],
  [
    "How can I pay?",
    "Payments are processed securely by Razorpay using UPI, cards, net banking and other enabled methods.",
  ],
  [
    "When does access begin?",
    "Access begins as soon as the payment is confirmed, usually within seconds.",
  ],
  ["Can I extend an active pass?", "Yes. A new purchase is added after your current expiry date."],
  [
    "What can I learn?",
    "Compare planets and moons, explore star classes and galaxies, inspect extreme objects, and read detailed explanations about selected destinations.",
  ],
  ["Does it work on phones?", "Yes, though a capable desktop provides the richest 3D experience."],
  [
    "Are all visuals literal photographs?",
    "No. The app combines measured astronomy data with physically inspired 3D visualizations and clearly identifies modelled systems.",
  ],
  [
    "Can I get a refund?",
    "Activated access is non-refundable except where required by law or for duplicate, failed or incorrect charges.",
  ],
];
export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Our Visible Universe" },
      {
        name: "description",
        content: "Answers about access passes, payments and the interactive educational universe.",
      },
      { property: "og:title", content: "FAQ — Our Visible Universe" },
      {
        property: "og:description",
        content: "Answers about access passes, payments and the interactive educational universe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="FAQ"
      title="Common questions."
      intro="Everything you need to know before beginning your journey."
    >
      <Accordion type="single" collapsible>
        {faqs.map(([q, a], i) => (
          <AccordionItem value={String(i)} key={q}>
            <AccordionTrigger className="text-base text-foreground">{q}</AccordionTrigger>
            <AccordionContent className="leading-7">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </InfoPage>
  ),
});
