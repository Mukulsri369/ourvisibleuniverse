import { useState, useRef, useEffect } from "react";

type PlanetKey = "earth" | "venus" | "mars";

const ORDER: PlanetKey[] = ["earth", "venus", "mars"];

const PLANETS: Record<
  PlanetKey,
  {
    name: string;
    still: string;
    clip: string;
    lede: string;
    cutout: string;
  }
> = {
  earth: {
    name: "EARTH",
    still:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_508c64b8-a31e-4290-bdfc-1187df70e0a6.png",
    clip: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_3ffb4889-c520-432d-8458-038009eb40df.mp4",
    lede: "Learn more about the fascinating details that we call our home, Planet Earth. Course enrollment starts today. Early Bird tickets typically last a week, don't miss out!",
    cutout:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202005_3346cc4d-ec3b-44ab-825c-b18e49f5021a.png",
  },
  venus: {
    name: "VENUS",
    still:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_cf55d1d8-7b59-4a64-80da-d72052ae974e.png",
    clip: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_b211cd74-013b-4dd3-bfd0-64491d8696fa.mp4",
    lede: "The hottest world in our solar system, wrapped in clouds of sulfuric acid. Course enrollment starts today. Early Bird tickets typically last a week, don't miss out!",
    cutout:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202012_640b239a-d08a-4200-adb2-741bbe129ac8.png",
  },
  mars: {
    name: "MARS",
    still:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_0ba6de7c-285d-43dc-b7ab-8c54c73707cb.png",
    clip: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_51eae59a-2459-4c84-907c-cc5edfe5fea7.mp4",
    lede: "The rust-red desert world, home to the tallest volcano we know of. Course enrollment starts today. Early Bird tickets typically last a week, don't miss out!",
    cutout:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202018_3d559490-f613-4ed7-a3bb-3b7e9fc90fb8.png",
  },
};

export function SpaceEduHero() {
  const [featured, setFeatured] = useState<PlanetKey>("earth");
  const videoRefs = useRef<Record<PlanetKey, HTMLVideoElement | null>>({
    earth: null,
    venus: null,
    mars: null,
  });

  const remaining = ORDER.filter((p) => p !== featured);
  const leftPlanet = remaining[0];
  const rightPlanet = remaining[1];

  const current = PLANETS[featured];

  useEffect(() => {
    // Play featured video, pause others
    ORDER.forEach((p) => {
      const v = videoRefs.current[p];
      if (!v) return;
      if (p === featured) {
        if (!v.src) v.src = PLANETS[p].clip;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [featured]);

  const switchPlanet = (target: PlanetKey) => {
    if (target === featured) return;
    setFeatured(target);
  };

  const warmVideo = (target: PlanetKey) => {
    const v = videoRefs.current[target];
    if (v && !v.src) {
      v.preload = "auto";
      v.src = PLANETS[target].clip;
      v.load();
    }
  };

  const scrollToNext = () => {
    const target = document.getElementById("parents");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden bg-[#04101f] text-white">
      {/* Background Videos with fallback poster stills */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-300"
        style={{ backgroundImage: `url("${current.still}")` }}
      >
        {ORDER.map((p) => (
          <video
            key={p}
            ref={(el) => {
              videoRefs.current[p] = el;
            }}
            src={p === "earth" ? PLANETS.earth.clip : undefined}
            data-src={PLANETS[p].clip}
            poster={PLANETS[p].still}
            muted
            loop
            playsInline
            preload={p === "earth" ? "auto" : "none"}
            aria-hidden="true"
            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
              p === featured ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Subtle cinematic gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04101f] via-black/25 to-black/40" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 flex h-full flex-col justify-between px-5 pt-20 pb-12 sm:px-8 lg:px-16">
        <div />

        {/* Central Typographic Composition */}
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <span className="text-sm font-medium tracking-[0.25em] text-white/90 sm:text-base">
            PLANET
          </span>

          <h1
            className="mt-2 text-6xl tracking-wide text-white sm:text-8xl md:text-9xl"
            style={{ fontFamily: "'Prata', Georgia, serif" }}
          >
            {current.name}
          </h1>

          {/* Cyan rule */}
          <div className="my-5 h-1.5 w-24 rounded-full bg-[#79dce8]" />

          <p className="max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            {current.lede}
          </p>

          {/* Flanked Action Row: Planet Left, Button, Planet Right */}
          <div className="relative mt-8 flex w-full max-w-md items-center justify-center">
            {/* Left Planet Slot Button */}
            <button
              type="button"
              onClick={() => switchPlanet(leftPlanet)}
              onPointerEnter={() => warmVideo(leftPlanet)}
              onFocus={() => warmVideo(leftPlanet)}
              aria-label={`Show ${PLANETS[leftPlanet].name}`}
              className="group absolute -left-16 sm:-left-28 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none"
            >
              <div className="relative size-16 sm:size-24 overflow-hidden rounded-full drop-shadow-2xl">
                <img
                  src={PLANETS[leftPlanet].cutout}
                  alt={PLANETS[leftPlanet].name}
                  className="size-full object-contain"
                />
              </div>
              <span
                className="mt-2 text-xs font-medium tracking-widest text-white/80 transition-colors group-hover:text-cyan-300 sm:text-sm"
                style={{ fontFamily: "'Prata', Georgia, serif" }}
              >
                {PLANETS[leftPlanet].name}
              </span>
            </button>

            {/* Central Glossy Pill Button */}
            <a
              href="#plans"
              className="inline-flex h-14 items-center justify-center rounded-full px-8 text-sm font-bold tracking-wider text-[#071227] shadow-[0_10px_25px_-5px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95"
              style={{
                background:
                  "linear-gradient(180deg, #ffffff 0%, #d6e8f8 4%, #d9ecfe 72%, #ffffff 100%)",
              }}
            >
              GET STARTED
            </a>

            {/* Right Planet Slot Button */}
            <button
              type="button"
              onClick={() => switchPlanet(rightPlanet)}
              onPointerEnter={() => warmVideo(rightPlanet)}
              onFocus={() => warmVideo(rightPlanet)}
              aria-label={`Show ${PLANETS[rightPlanet].name}`}
              className="group absolute -right-16 sm:-right-28 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none"
            >
              <div className="relative size-16 sm:size-24 overflow-hidden rounded-full drop-shadow-2xl">
                <img
                  src={PLANETS[rightPlanet].cutout}
                  alt={PLANETS[rightPlanet].name}
                  className="size-full object-contain"
                />
              </div>
              <span
                className="mt-2 text-xs font-medium tracking-widest text-white/80 transition-colors group-hover:text-cyan-300 sm:text-sm"
                style={{ fontFamily: "'Prata', Georgia, serif" }}
              >
                {PLANETS[rightPlanet].name}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Centered Scroll Down Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={scrollToNext}
            aria-label="Scroll to next section"
            className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-[#181e2a]/70 backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
          >
            <svg viewBox="0 0 26 33" fill="none" className="size-5" aria-hidden="true">
              <path
                d="M13 1.5 V31.5 M1.9 20.4 L13 31.5 L24.1 20.4"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
