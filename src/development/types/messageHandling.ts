import type { AsNumber, OneWayMessageStructureType, Response, ThreadArchitecture, TKeysMatching } from "./messageStructure";

export const enum EMessageType {
  OneWay,
  Call,
  Response,
}

export type TPromiseOrNot<T> = T | Promise<T>;

export type TConditionalHandler<
  TStructure extends OneWayMessageStructureType,
  TKey extends keyof TStructure & number>
  = TStructure[TKey] extends Response<any>
  ? (payload: TStructure[TKey]['payload']) => TPromiseOrNot<TStructure[TKey]['response']>
  : (payload: TStructure[TKey]['payload']) => TPromiseOrNot<void>;

export type HandlerCollection<TArchitecture extends ThreadArchitecture, TDirection extends TKeysMatching<ThreadArchitecture, OneWayMessageStructureType>> = {
  [Key in keyof TArchitecture[TDirection]]:
  TConditionalHandler<TArchitecture[TDirection], AsNumber<Key>> };

export type TConditionalResponder<
  TStructure extends OneWayMessageStructureType,
  TKey extends keyof TStructure & number>
  = TStructure[TKey] extends Response<any>
  ? (response: TStructure[TKey]['response']) => void
  : never;
