import telescopeImg from "@/assets/images/product_telescope_1791937876568.jpg";
import meteoriteImg from "@/assets/images/product_meteorite_1791937877247.jpg";
import starglobeImg from "@/assets/images/product_starglobe_1791937878788.jpg";
import binocularsImg from "@/assets/images/product_binoculars_1791937878072.jpg";

export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  image: string;
  badge: string;
  description: string;
  url: string;
};

export const STORE_CATALOG: StoreProduct[] = [
  {
    id: "celestial-refractor-70mm",
    name: "AstroTech 70mm Refractor Telescope & Tripod",
    category: "Optical Telescopes",
    price: "₹8,499",
    originalPrice: "₹10,999",
    image: telescopeImg,
    badge: "Best for Kids & Beginners",
    description:
      "Fully coated glass optics with 70mm aperture. Clearly reveals lunar craters, Jupiter's Galilean moons, and Saturn's rings from your terrace.",
    url: "https://ourvisibleuniverse.store",
  },
  {
    id: "campo-meteorite-specimen",
    name: "Campo del Cielo Iron Meteorite Specimen (Certified)",
    category: "Space Artifacts",
    price: "₹3,999",
    originalPrice: "₹4,999",
    image: meteoriteImg,
    badge: "Authentic 4.5-Billion-Yr Artifact",
    description:
      "A real iron-nickel celestial fragment forged before Earth formed. Complete with natural atmospheric entry regmaglypts and museum certificate of authenticity.",
    url: "https://ourvisibleuniverse.store",
  },
  {
    id: "illuminated-celestial-globe",
    name: "Illuminated Constellation & Star Map Globe",
    category: "Stargazer Decor",
    price: "₹4,250",
    originalPrice: "₹5,400",
    image: starglobeImg,
    badge: "Glowing Night Starlight",
    description:
      "88 officially recognized constellations, celestial coordinates, and major nebulae. Glows warmly in a child's bedroom on a brushed brass desktop mount.",
    url: "https://ourvisibleuniverse.store",
  },
  {
    id: "deep-sky-binoculars-10x50",
    name: "Stargazer 10x50 Wide-Angle Optical Binoculars",
    category: "Field Observation",
    price: "₹4,799",
    originalPrice: "₹5,999",
    image: binocularsImg,
    badge: "Terrace & Camping Ready",
    description:
      "BAK-4 porro prisms with multi-coated optics. Ultra-wide field of view designed specifically for sweeping the Milky Way, star clusters, and the Andromeda Galaxy.",
    url: "https://ourvisibleuniverse.store",
  },
  {
    id: "orrery-solar-system-kit",
    name: "Mechanical Solar System Orrery STEM Kit",
    category: "Hands-On STEM",
    price: "₹2,899",
    originalPrice: "₹3,500",
    image: telescopeImg,
    badge: "Interactive STEM Project",
    description:
      "Precision brass gear-driven model demonstrating real relative orbital speeds of the inner terrestrial planets and outer gas giants.",
    url: "https://ourvisibleuniverse.store",
  },
  {
    id: "precision-celestial-planisphere",
    name: "Precision All-Latitude Night Sky Planisphere",
    category: "Sky Charts",
    price: "₹1,299",
    originalPrice: "₹1,699",
    image: starglobeImg,
    badge: "Lifelong Guide",
    description:
      "Dial in any hour, date, and season to instantly see which constellations and planets are overhead. Weatherproof and double-laminated for night dew.",
    url: "https://ourvisibleuniverse.store",
  },
];

export function getRandomStoreProducts(count = 6): StoreProduct[] {
  const shuffled = [...STORE_CATALOG].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
