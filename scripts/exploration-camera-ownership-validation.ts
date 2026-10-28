import assert from "node:assert/strict";
import { useStore } from "../src/stars/store";
import { useExploration } from "../src/stars/exploration-scope";
import { useGalaxyJourney } from "../src/stars/galaxy-journey";
import { HOME_GALAXY } from "../src/stars/exploration-galaxies";
import { navigateExplorationTarget } from "../src/stars/exploration-navigation";

useExploration.setState({ phase: "inside", galaxy: "Milky Way", pending: null });
useStore.setState({ guidedJourneyActive: false, flyTo: null });
useStore.getState().startGuidedJourney();
assert.equal(
  useStore.getState().guidedJourneyActive,
  false,
  "A scale tour cannot bypass explicit galaxy exit",
);
assert.equal(useStore.getState().flyTo, null, "The current camera must remain owned by the galaxy");
assert.equal(useExploration.getState().pending?.kind, "journey");
assert.equal(useExploration.getState().pending?.host, null);
const pending = useExploration.getState().pending!;
useExploration.setState({ phase: "outside", galaxy: null });
navigateExplorationTarget(pending);
assert(useStore.getState().guidedJourneyActive);
assert.equal(useStore.getState().guidedJourneyStep, 0);
assert.equal(
  useStore.getState().uiHidden,
  false,
  "The scale-tour controls must be available after exit",
);
useStore.getState().stopGuidedJourney();
useExploration.setState({ phase: "inside", galaxy: "Milky Way", pending: null });
useStore.getState().setGuidedJourneyStep(3);
assert.equal(useStore.getState().guidedJourneyActive, false);
assert.equal(
  useExploration.getState().pending?.journeyStep,
  3,
  "A requested scale stage must survive exit",
);
const stage = useExploration.getState().pending!;
useExploration.setState({ phase: "outside", galaxy: null });
navigateExplorationTarget(stage);
assert.equal(useStore.getState().guidedJourneyStep, 3);
useGalaxyJourney.getState().enter(HOME_GALAXY);
assert.equal(
  useStore.getState().guidedJourneyActive,
  false,
  "Galaxy entry stops the competing scale tour",
);
useStore.getState().startGuidedJourney();
assert.equal(useStore.getState().guidedJourneyActive, false, "A new tour cannot interrupt entry");
useGalaxyJourney.getState().reset();
console.log(
  "PASS: scale tours require explicit galaxy exit, preserve a pending stage, expose controls and release camera ownership before galaxy entry",
);
