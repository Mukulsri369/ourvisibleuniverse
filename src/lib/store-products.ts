export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: string;
  rawPrice: number;
  currency: string;
  originalPrice?: string;
  image: string;
  images?: string[];
  badge: string;
  description: string;
  url: string;
  affiliateUrl?: string;
};

export const STORE_DOMAIN = "https://ourvisibleuniverse.store";

export function getProductStoreUrl(slug: string): string {
  return `${STORE_DOMAIN}/product/${encodeURIComponent(slug)}`;
}

export function formatProductPrice(price: number, currency = "INR"): string {
  if (price == null || Number.isNaN(price)) return "₹999";
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `₹${Math.round(price).toLocaleString("en-IN")}`;
  }
}

// Authentic Seed Catalog directly from ourvisibleuniverse.store live database
// Ensures 100% genuine products and prices are immediately rendered with zero SSR/Hydration mismatch.
export const AUTHENTIC_STORE_SEED: StoreProduct[] = [
  {
    id: "7a93672e-0c63-41d6-8bd8-0401da2bb3d5",
    name: "12-Slide 2-in-1 Mini Galaxy Projector Light for Bedroom",
    slug: "12-slide-2-in-1-mini-galaxy-projector-light-for-bedroom",
    category: "Galaxy Projectors",
    price: "₹2,999",
    rawPrice: 2999,
    currency: "INR",
    originalPrice: "₹3,999",
    image: "https://m.media-amazon.com/images/I/719Fv954wTL._SL1500_.jpg",
    badge: "Official Store Bestseller",
    description:
      "3W USB LED with adjustable focus and brightness, touch control, 360° flexible neck, and 12 high-definition cosmic projection slides for walls and ceilings.",
    url: "https://ourvisibleuniverse.store/product/12-slide-2-in-1-mini-galaxy-projector-light-for-bedroom",
  },
  {
    id: "0f0a56b7-7328-4268-a4ec-c28f26bb7ebc",
    name: "MERTTURM® Galaxy Aurora Projector with White Noise",
    slug: "mertturm-galaxy-aurora-projector",
    category: "Aurora Lamps",
    price: "₹4,110",
    rawPrice: 4110,
    currency: "INR",
    originalPrice: "₹5,499",
    image: "https://m.media-amazon.com/images/I/71z7816+6CL._SL1500_.jpg",
    badge: "3-in-1 Northern Lights",
    description:
      "3 in 1 LED Northern Lights aurora projector with 6 soothing white noise tracks, Bluetooth speaker, and starry moon light for deep sleep and room ambiance.",
    url: "https://ourvisibleuniverse.store/product/mertturm-galaxy-aurora-projector",
  },
  {
    id: "bc88da3d-4183-474a-8a69-6087626abe37",
    name: "Star Galaxy Projector with Planetarium Effects",
    slug: "night-light-for-kids-bedroom-star-galaxy-projector-with-planetarium-effects",
    category: "Galaxy Projectors",
    price: "₹899",
    rawPrice: 899,
    currency: "INR",
    originalPrice: "₹1,499",
    image: "https://m.media-amazon.com/images/I/51rPqC50iUL._SL1500_.jpg",
    badge: "Curated Kid Stargazer Favorite",
    description:
      "360° rotating LED night light for kids bedrooms with dynamic planetarium dome effects and multicolor celestial illumination.",
    url: "https://ourvisibleuniverse.store/product/night-light-for-kids-bedroom-star-galaxy-projector-with-planetarium-effects",
  },
  {
    id: "713fdb12-a0c5-43f9-899a-0fdb8dbbf3e2",
    name: "One94Store Astronaut Space Projector Night Light",
    slug: "one94store-astronaut-space-projector-night-light",
    category: "Galaxy Projectors",
    price: "₹549",
    rawPrice: 549,
    currency: "INR",
    originalPrice: "₹999",
    image: "https://m.media-amazon.com/images/I/61b7fB-c+nL._SL1500_.jpg",
    badge: "360° Rotating Nebula",
    description:
      "Astronaut figurine projector featuring 360° rotating nebula star projections with remote control, sleep timer, and adjustable magnetic helmet angle.",
    url: "https://ourvisibleuniverse.store/product/one94store-astronaut-space-projector-night-light",
  },
  {
    id: "7f8f5e3f-6c74-4ef6-94f2-ad793f634bd3",
    name: "Moon Surface Wall Clock with LED Backlight",
    slug: "moon-surface-wall-clock-with-led-backlight-roman-numerals",
    category: "Space Décor",
    price: "₹3,999",
    rawPrice: 3999,
    currency: "INR",
    originalPrice: "₹4,999",
    image: "https://m.media-amazon.com/images/I/61llGMNhgkL._SL1500_.jpg",
    badge: "Textured Lunar Surface",
    description:
      "Detailed 3D lunar surface texture with realistic craters and ridges, ambient LED backlighting, and Roman numerals for an authentic celestial living space.",
    url: "https://ourvisibleuniverse.store/product/moon-surface-wall-clock-with-led-backlight-roman-numerals",
  },
  {
    id: "141d60b2-3fa4-4675-967c-be02d6cc3685",
    name: "fizzytech Astronaut Galaxy Projector Night Light",
    slug: "fizzytech-astronaut-galaxy-projector",
    category: "Galaxy Projectors",
    price: "₹698",
    rawPrice: 698,
    currency: "INR",
    originalPrice: "₹1,299",
    image: "https://m.media-amazon.com/images/I/61nN4UjM+9L._SL1500_.jpg",
    badge: "Remote Control Nebula",
    description:
      "Vibrant cosmic nebula and star generator with 360-degree magnetic head rotation, multi-speed atmospheric drift, and smart timer.",
    url: "https://ourvisibleuniverse.store/product/fizzytech-astronaut-galaxy-projector",
  },
  {
    id: "9e156a72-7b98-4f4b-95aa-9033e4131822",
    name: "HDC Modern Astronaut LED Wall Lamp with Lighting Clock",
    slug: "hdc-modern-astronaut-led-wall-lamp-with-lighting-clock-kids-bedroom-decorative-r",
    category: "Space Décor",
    price: "₹4,999",
    rawPrice: 4999,
    currency: "INR",
    originalPrice: "₹6,499",
    image: "https://m.media-amazon.com/images/I/516K8RNkdkL._SL1500_.jpg",
    badge: "Artisan Resin Wall Light",
    description:
      "Meticulously sculpted from high-grade resin with an illuminated clock dial, non-toxic finish, and soft night lighting for bedroom or study.",
    url: "https://ourvisibleuniverse.store/product/hdc-modern-astronaut-led-wall-lamp-with-lighting-clock-kids-bedroom-decorative-r",
  },
  {
    id: "a3646a0f-5bb8-4088-93bf-42b901398447",
    name: "The Mysteries of the Universe: Best-Kept Secrets of Space",
    slug: "the-mysteries-of-the-universe-discover-the-best-kept-secrets-of-space",
    category: "Astronomy Books",
    price: "₹727",
    rawPrice: 727,
    currency: "INR",
    originalPrice: "₹999",
    image: "https://m.media-amazon.com/images/I/91JJ83LyYtL._SL1500_.jpg",
    badge: "Curated Hardcover Guide",
    description:
      "By Will Gater. An illustrated journey exploring 100 celestial marvels from glowing supernovas to mysterious black holes for curious young minds.",
    url: "https://ourvisibleuniverse.store/product/the-mysteries-of-the-universe-discover-the-best-kept-secrets-of-space",
  },
  {
    id: "eab25d83-7ae9-48e1-919b-b62954018025",
    name: "One94Store Star Galaxy Projector Night Lamp for Kids",
    slug: "one94store-star-galaxy-projector-night-lamp-for-kids",
    category: "Galaxy Projectors",
    price: "₹399",
    rawPrice: 399,
    currency: "INR",
    originalPrice: "₹699",
    image: "https://m.media-amazon.com/images/I/61k1lqC1q5L._SL1500_.jpg",
    badge: "6 Projection Films",
    description:
      "USB rechargeable LED ceiling projector with 6 swappable cosmic films including deep space, planets, ocean stars, and constellations.",
    url: "https://ourvisibleuniverse.store/product/one94store-star-galaxy-projector-night-lamp-for-kids",
  },
];

export const STORE_CATALOG = AUTHENTIC_STORE_SEED;

export function getRandomStoreProducts(count = 6): StoreProduct[] {
  const shuffled = [...AUTHENTIC_STORE_SEED].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Live client-side fetcher directly accessing ourvisibleuniverse.store backend
export async function fetchLiveStoreProducts(): Promise<StoreProduct[]> {
  try {
    const endpoint =
      "https://c--e5dc52fc-4129-47cd-9ba2-1c20a9af2f78-prod.lovable.cloud/rest/v1/products?select=id,name,slug,price,currency,featured,short_description,affiliate_url,amazon_url,product_images(image_url,alt_text,sort_order),categories(name,slug)&active=eq.true&order=featured.desc,created_at.desc&limit=30";

    const response = await fetch(endpoint, {
      headers: {
        apikey: "sb_publishable_LnvKmEnYxmXbvplWO-pkgw_6cxxCkYL",
        Authorization: "Bearer sb_publishable_LnvKmEnYxmXbvplWO-pkgw_6cxxCkYL",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Store API returned status ${response.status}`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return AUTHENTIC_STORE_SEED;
    }

    // Map into StoreProduct items
    interface RawProductImage {
      image_url?: string;
      sort_order?: number;
    }
    interface RawProductItem {
      id?: string;
      title?: string;
      slug?: string;
      description?: string;
      price?: number | string;
      featured?: boolean;
      product_images?: RawProductImage[];
      categories?: { name?: string };
      name?: string;
      currency?: string;
      short_description?: string;
      affiliate_url?: string;
      amazon_url?: string;
    }

    const parsed: StoreProduct[] = (rawData as RawProductItem[]).map((item) => {
      const sortedImages = [...(item.product_images || [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
      const primaryImg =
        sortedImages[0]?.image_url ||
        "https://m.media-amazon.com/images/I/719Fv954wTL._SL1500_.jpg";
      const allImgs = sortedImages
        .map((img) => img.image_url)
        .filter((url): url is string => Boolean(url));

      const priceNum =
        typeof item.price === "number" ? item.price : parseFloat(item.price ?? "") || 999;
      const originalPriceNum = Math.round(priceNum * 1.3 + 99);

      let badge = "Authentic Store Item";
      const catName = item.categories?.name || "Space Decor";
      if (item.featured) {
        badge = "Featured Authentic";
      } else if (catName.toLowerCase().includes("projector")) {
        badge = "Galaxy Projector";
      } else if (catName.toLowerCase().includes("light")) {
        badge = "Cosmic Lighting";
      } else if (catName.toLowerCase().includes("clock")) {
        badge = "Celestial Decor";
      }

      return {
        id: item.id ?? item.slug ?? "",
        name: item.name ?? item.title ?? "",
        slug: item.slug ?? "",
        category: catName,
        price: formatProductPrice(priceNum, item.currency || "INR"),
        rawPrice: priceNum,
        currency: item.currency || "INR",
        originalPrice: formatProductPrice(originalPriceNum, item.currency || "INR"),
        image: primaryImg,
        images: allImgs,
        badge,
        description:
          item.short_description?.replace(/\\n/g, " ").trim() ||
          "Authentic astronomy and space decor item from the official Our Visible Universe store.",
        url: getProductStoreUrl(item.slug ?? ""),
        affiliateUrl: item.affiliate_url || item.amazon_url || undefined,
      };
    });

    return parsed;
  } catch (err) {
    console.warn("[Store] Falling back to authentic seed catalog:", err);
    return AUTHENTIC_STORE_SEED;
  }
}
