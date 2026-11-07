import type { ObjectCategory, ObjectVisual } from "./observed-objects";
export type M31Model =
  | "hii"
  | "planetary"
  | "absorption-remnant"
  | "molecular-cloud"
  | "nova-shell"
  | "xray-pulsar"
  | "ulx-candidate";
export type M31ScientificTarget = {
  id: string;
  name: string;
  aliases: readonly string[];
  ra: number;
  dec: number;
  category: ObjectCategory;
  subtype: string;
  visual: ObjectVisual;
  color: string;
  extent: number;
  source: string;
  description: string;
  model?: M31Model;
  positionNote?: string;
  references?: readonly string[];
  facts?: readonly string[];
};
