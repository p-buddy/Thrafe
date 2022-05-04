import type TContext from './TContext';
import type { OneWayMessageStructureType, ResponseType, TPostedMessage } from "./messageStructure";

type THandlers = Function[] | undefined;
const messageHandlers: THandlers[] = [[]];
const responseHandlers: THandlers[] = [[]];

type TFreeIDs = (number[] | undefined);
const freeResponseIDs: TFreeIDs[] = [[]];

export type TConditionalHandler<
  TStructure extends OneWayMessageStructureType,
  TKey extends keyof TStructure & number>
  = TStructure[TKey] extends ResponseType<any>
  ? (payload: TStructure[TKey]['payload']) => TStructure[TKey]['response']
  : (payload: TStructure[TKey]['payload']) => void;

export const handle = <
  TStructure extends OneWayMessageStructureType,
  TEventKey extends keyof TStructure & number>(
    context: TContext,
    event: TEventKey,
    handler: TConditionalHandler<TStructure, TEventKey>
  ) => {
  context.onmessage ?? (context.onmessage = messageHandler);
  while (messageHandlers.length <= event) messageHandlers.push(undefined);
  messageHandlers[event]?.push(handler) ?? (messageHandlers[event] = [handler]);
}

type TConditionalResponder<
  TStructure extends OneWayMessageStructureType,
  TKey extends keyof TStructure & number>
  = TStructure[TKey] extends ResponseType<any>
  ? (response: TStructure[TKey]['response']) => void
  : never;

export const addResponseHandler = <
  TStructure extends OneWayMessageStructureType,
  TEventKey extends keyof TStructure & number>(
    context: TContext,
    event: TEventKey,
    handler: TConditionalResponder<TStructure, TEventKey>
  ): number => {
  context.onmessage ?? (context.onmessage = messageHandler);
  while (responseHandlers.length <= event) responseHandlers.push(undefined);
  responseHandlers[event] ?? (responseHandlers[event] = [handler]);
  if (responseHandlers[event]?.length === 1) return 0;
  if (freeResponseIDs.length < event || !freeResponseIDs[event]) return (responseHandlers[event]?.push(handler) ?? 0) - 1;
  const id = freeResponseIDs[event]?.pop() as number ?? -1;
  (responseHandlers[event] as Function[])[id] = handler;
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

const messageHandler = (ev: MessageEvent<TPostedMessage>): void => {
  const { event, payload, responseID, isResponse } = ev.data;
  const messageType = responseID !== undefined ? isResponse ? EMessageType.Response : EMessageType.Call : EMessageType.OneWay
  switch (messageType) {
    case EMessageType.OneWay:
      for (let index = 0; index < (messageHandlers[event]?.length ?? 0); index++) ((messageHandlers[event] as Function[])[index] as Function)(payload);
      return;
    case EMessageType.Call:
      return postMessage({ event, payload: ((messageHandlers[event] as Function[])[0] as Function)(payload), responseID, isResponse: true } as TPostedMessage);
    case EMessageType.Response:
      return returnResponseID(((responseHandlers[event] as Function[])[responseID as number] as Function)(payload) as number, event);
  }
}