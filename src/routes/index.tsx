import { createFileRoute } from "@tanstack/react-router";
import { StarsApp } from "../stars/StarsApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "100,000 Stars — An interactive map of the stellar neighborhood" },
      { name: "description", content: "Cinematic 3D visualization of our nearest stars, the Sun, the Oort Cloud, and the Milky Way." },
      { property: "og:title", content: "100,000 Stars" },
      { property: "og:description", content: "Cinematic 3D visualization of our nearest stars." },
    ],
  }),
  component: Index,
});

function Index() {
  return <StarsApp />;
}
