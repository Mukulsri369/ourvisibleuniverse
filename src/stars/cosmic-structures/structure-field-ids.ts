import { STRUCTURE_FIELDS, type StructureFieldId } from "./structure-fields.generated";

export function isStructureFieldId(id: string): id is StructureFieldId {
  return id in STRUCTURE_FIELDS;
}
