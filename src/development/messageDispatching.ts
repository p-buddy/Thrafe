import type TScope from './TScope';
import { addResponseHandler } from "./messageHandling";
import type { OneWayMessageStructureType, Response, TPostedMessage, TwoWayEvents } from "./messageStructure";

export type TOnResponse<
  TStructure extends OneWayMessageStructureType,
  TEventKey extends keyof TStructure & number> =
  TStructure[TEventKey] extends Response<any>
  ? [(response: TStructure[TEventKey]['response']) => void]
  : [];

export const dispatch = <
  TStructure extends OneWayMessageStructureType,
  TEventKey extends keyof TStructure & number>(
    scope: TScope,
    event: TEventKey,
    payload: TStructure[TEventKey]['payload'],
    ...onResponse: TOnResponse<TStructure, TEventKey>
  ) => {
  onResponse.length > 0
    ? scope.postMessage({ event, payload, responseID: addResponseHandler<TStructure, TEventKey>(event, onResponse[0] as any) } as TPostedMessage)
    : scope.postMessage({ event, payload } as TPostedMessage);
}

type TConditionalResponse<
  TStructure extends OneWayMessageStructureType,
  TKey extends keyof TStructure & number>
  = TStructure[TKey] extends Response<any>
  ? TStructure[TKey]['response']
  : never;

export const resolve = async <
  TStructure extends OneWayMessageStructureType,
  TEventKey extends TwoWayEvents<TStructure>>(
    scope: TScope,
    event: TEventKey,
    payload: TStructure[TEventKey]['payload']): Promise<TConditionalResponse<TStructure, TEventKey>> => {
  return new Promise((resolve) => {
    scope.postMessage({ event, payload, responseID: addResponseHandler<TStructure, TEventKey>(event, resolve as any) } as TPostedMessage);
  });
}