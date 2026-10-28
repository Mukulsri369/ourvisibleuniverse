import { makeGalaxyStarData } from "./galaxy-star-data";
import type { GalaxyModel } from "./galaxy-models";
self.onmessage = (event: MessageEvent<{ model: GalaxyModel; count: number }>) => {
  const data = makeGalaxyStarData(event.data.model, event.data.count);
  self.postMessage(data, {
    transfer: [
      data.positions.buffer,
      data.colors.buffer,
      data.luminosities.buffer,
      data.phases.buffer,
      ...(data.indices ? [data.indices.buffer] : []),
    ],
  });
};
