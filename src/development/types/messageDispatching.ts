import type { OneWayMessageStructureType, Response } from "./messageStructure";

export type TOnResponse<
  TStructure extends OneWayMessageStructureType,
  TEventKey extends keyof TStructure & number> =
  TStructure[TEventKey] extends Response<any>
  ? [(response: TStructure[TEventKey]['response']) => void]
  : [];

export type TConditionalResponse<
  TStructure extends OneWayMessageStructureType,
  TKey extends keyof TStructure & number>
  = TStructure[TKey] extends Response<any>
  ? TStructure[TKey]['response']
  : never;