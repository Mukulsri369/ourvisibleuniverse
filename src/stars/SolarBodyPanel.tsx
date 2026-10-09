import { Button } from "@/components/ui/button";
import { HideablePanel, NasaResources } from "./NasaResources";
import { PLANETS, SOLAR_MOONS, AU } from "./Planets";
import { useStore } from "./store";
import { EARTH_RADIUS } from "./simulation";

export function SolarBodyPanel() {
  const visit = useStore((s) => s.visitPlanet);
  const exo = useStore((s) => s.exoVisit);
  const setVisit = useStore((s) => s.setVisitPlanet);
  if (!visit || exo) return null;
  const satellite = SOLAR_MOONS.get(visit);
  const planet = satellite?.planet ?? PLANETS.find((p) => p.name === visit);
  if (!planet) return null;
  const body = satellite?.moon ?? planet;
  const ephemeris = !satellite || ["Moon", "Io", "Europa", "Ganymede", "Callisto"].includes(body.name);
  return <HideablePanel resetKey={visit} label={body.name}>{(hide) => (
    <aside className="fixed right-0 top-0 z-30 max-h-[70vh] w-full max-w-[380px] overflow-y-auto border-l border-border bg-background/95 p-6 text-foreground backdrop-blur-md md:max-h-screen md:h-full">
      {hide}
      <Button variant="ghost" size="icon" className="absolute right-3 top-3" aria-label="Exit body visit" onClick={() => setVisit(null)}>×</Button>
      <p className="text-xs text-muted-foreground">{satellite ? `${planet.name} · Moon` : "Solar System"}</p>
      <h2 className="mt-2 pr-16 text-2xl">{body.name}</h2>
      <NasaResources name={body.name} query={body.name} />
      {!satellite && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{planet.description}</p>}
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <dt className="text-muted-foreground">Mean radius</dt><dd>{(body.size / EARTH_RADIUS * 6371).toLocaleString(undefined, { maximumFractionDigits: 1 })} km</dd>
        <dt className="text-muted-foreground">Orbital distance</dt><dd>{satellite ? `${(satellite.moon.distance / AU * 149597870.7).toLocaleString(undefined, { maximumFractionDigits: 0 })} km` : `${(planet.a / AU).toFixed(3)} AU`}</dd>
        <dt className="text-muted-foreground">Sidereal orbit</dt><dd>{body.period.toLocaleString(undefined, { maximumFractionDigits: 4 })} days</dd>
        {!satellite && <><dt className="text-muted-foreground">Sidereal rotation</dt><dd>{Math.abs(planet.spinPeriod * 24).toLocaleString(undefined, { maximumFractionDigits: 3 })} h</dd></>}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{ephemeris ? "Position calculated for the simulation date using astronomical ephemerides." : "Mean orbital elements; this moon’s orbital phase is modelled, not a live measured position."}</p>
      {satellite && <Button variant="outline" className="mt-4 w-full" onClick={() => setVisit(planet.name)}>Return to {planet.name}</Button>}
    </aside>
  )}</HideablePanel>;
}