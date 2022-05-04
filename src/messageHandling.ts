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

  if (context.onmessage === null) {
    context.onmessage = messageHandler;
  }

  while (messageHandlers.length <= event) {
    messageHandlers.push(undefined);
  }

  if (messageHandlers[event] === undefined) {
    messageHandlers[event] = [handler];
  } else {
    messageHandlers[event]?.push(handler);
  }
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

  if (context.onmessage === null) {
    context.onmessage = messageHandler;
  }

  while (responseHandlers.length <= event) {
    responseHandlers.push(undefined);
  }

  if (responseHandlers[event] === undefined) {
    responseHandlers[event] = [handler];
    return 0;
  }

  if (freeResponseIDs.length > event && (freeResponseIDs[event]?.length ?? 0) > 0) {
    const id = (freeResponseIDs[event] as number[]).pop() as number;
    (responseHandlers[event] as Function[])[id] = handler;
    return id;
  }

  responseHandlers[event]?.push(handler);
  return responseHandlers[event]?.length ?? -1;
}

const enum EMessageType {
  OneWay,
  Call,
  Response,
}

const validate = (msgType: EMessageType, event: number) => {
  switch (msgType) {
    case EMessageType.OneWay:
    case EMessageType.Call:
      if (messageHandlers.length > event && (messageHandlers[event]?.length ?? 0) > 0) break;
      throw new Error(`No handler has been added to handle event (#${event})`);
    case EMessageType.Response:
      if (responseHandlers.length > event && (responseHandlers[event]?.length)) break;
      throw new Error(`No responder has been added to handle event (#${event}). This is likely an internal error.`);
  }
}

const returnResponseID = (id: number, event: number) => {
  while (freeResponseIDs.length <= event) {
    freeResponseIDs.push(undefined);
  }

  if (freeResponseIDs[event] === undefined) {
    freeResponseIDs[event] = [id];
    return;
  }

  freeResponseIDs[event]?.push(id);
  if (freeResponseIDs[event]?.length === responseHandlers[event]?.length) {
    freeResponseIDs[event] = undefined;
  }
}

const messageHandler = (ev: MessageEvent<TPostedMessage>): void => {
  const { event, payload, responseID, isResponse } = ev.data;
  const messageType = responseID !== undefined
    ? isResponse
      ? EMessageType.Response
      : EMessageType.Call
    : EMessageType.OneWay

  validate(messageType, event);

  switch (messageType) {
    case EMessageType.OneWay:
      const length = messageHandlers[event]?.length ?? 0;
      for (let index = 0; index < length; index++) {
        ((messageHandlers[event] as Function[])[index] as Function)(payload);
      }
      return;
    case EMessageType.Call:
      const result = ((messageHandlers[event] as Function[])[0] as Function)(payload);
      postMessage({ event, payload: result, responseID, isResponse: true } as TPostedMessage);
      return;
    case EMessageType.Response:
      ((responseHandlers[event] as Function[])[responseID as number] as Function)(payload);
      returnResponseID(responseID as number, event);
      return;
  }
}