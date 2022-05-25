import type TScope from './TScope';
import type { AsNumber, OneWayMessageStructureType, Response, ThreadArchitectureType, TKeysMatching, TPostedMessage } from "./messageStructure";

type THandlers = Function[] | undefined;
const messageHandlers: THandlers[] = [[]];
const responseHandlers: THandlers[] = [[]];

type TFreeIDs = (number[] | undefined);
const freeResponseIDs: TFreeIDs[] = [[]];

type TPromiseOrNot<T> = T | Promise<T>;

export type TConditionalHandler<
  TStructure extends OneWayMessageStructureType,
  TKey extends keyof TStructure & number>
  = TStructure[TKey] extends Response<any>
  ? (payload: TStructure[TKey]['payload']) => TPromiseOrNot<TStructure[TKey]['response']>
  : (payload: TStructure[TKey]['payload']) => TPromiseOrNot<void>;

export type HandlerCollection<TArchitecture extends ThreadArchitectureType, TDirection extends TKeysMatching<ThreadArchitectureType, OneWayMessageStructureType>> = {
  [Key in keyof TArchitecture[TDirection]]:
  TConditionalHandler<TArchitecture[TDirection], AsNumber<Key>> };



export const initHandlers = <
  T extends ThreadArchitectureType,
  TDirection extends TKeysMatching<
    ThreadArchitectureType,
    OneWayMessageStructureType> = "ToThread">
  (scope: TScope, handlers: HandlerCollection<T, TDirection>) => {
  scope.onmessage = messageHandler;
  for (const key in handlers) {
    handle(parseInt(key), handlers[key]);
  }
}

export const handle = <
  TStructure extends OneWayMessageStructureType,
  TEventKey extends keyof TStructure & number>(
    event: TEventKey,
    handler: TConditionalHandler<TStructure, TEventKey>
  ) => {
  while (messageHandlers.length <= event) messageHandlers.push(undefined);
  messageHandlers[event]?.push(handler) ?? (messageHandlers[event] = [handler]);
}

type TConditionalResponder<
  TStructure extends OneWayMessageStructureType,
  TKey extends keyof TStructure & number>
  = TStructure[TKey] extends Response<any>
  ? (response: TStructure[TKey]['response']) => void
  : never;

export const addResponseHandler = <
  TStructure extends OneWayMessageStructureType,
  TEventKey extends keyof TStructure & number>(
    event: TEventKey,
    handler: TConditionalResponder<TStructure, TEventKey>
  ): number => {
  while (responseHandlers.length <= event) responseHandlers.push(undefined);
  const arr = responseHandlers[event] as Function[];
  if (!arr) {
    responseHandlers[event] = [handler];
    return 0;
  }
  const free = freeResponseIDs.length < event ? undefined : freeResponseIDs[event];
  if (!free || free.length === 0) {
    return ((arr?.push(handler) ?? 0) - 1);
  }
  const id = free?.pop() as number ?? -1;
  arr[id] = handler;
  return id;
}

const enum EMessageType {
  OneWay,
  Call,
  Response,
}

const returnResponseID = (id: number, event: number) => {
  while (freeResponseIDs.length <= event) freeResponseIDs.push(undefined);
  freeResponseIDs[event]?.push(id) ?? (freeResponseIDs[event] = [id]);
  if (freeResponseIDs[event]?.length === responseHandlers[event]?.length) freeResponseIDs[event] = undefined;
}

const objectIdentifier = "object";
const functionIdentifier = "function";

const isPromise = (returnValue: any): boolean => {
  return typeof returnValue === objectIdentifier && typeof returnValue?.then === functionIdentifier
};

const messageHandler = async (ev: MessageEvent<TPostedMessage>): Promise<void> => {
  const { event, payload, responseID, isResponse } = ev.data;
  const messageType = responseID !== undefined ? isResponse ? EMessageType.Response : EMessageType.Call : EMessageType.OneWay
  switch (messageType) {
    case EMessageType.OneWay:
      for (let index = 0; index < (messageHandlers[event]?.length ?? 0); index++) ((messageHandlers[event] as Function[])[index] as Function)(payload);
      return;
    case EMessageType.Call:
      const result = ((messageHandlers[event] as Function[])[0] as Function)(payload);
      return isPromise(result)
        ? (result as Promise<any>).then((resolved) => postMessage({ event, payload: resolved, responseID, isResponse: true } as TPostedMessage))
        : postMessage({ event, payload: result, responseID, isResponse: true } as TPostedMessage);
    case EMessageType.Response:
      return returnResponseID(((responseHandlers[event] as Function[])[responseID as number] as Function)(payload) as number, event);
  }
}