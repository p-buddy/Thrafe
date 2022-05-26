import type { CommunicationDirection, DispatchDirectionByContext, HandleDirectionByContext, OneWayEvents, OneWayMessageStructureType, Response, ThreadArchitecture, ThreadContext, TKeysNotMatching, TPostedMessage, TwoWayEvents } from './types/messageStructure';
import { TConditionalHandler, HandlerCollection, EMessageType, TConditionalResponder } from './types/messageHandling';
import TScope from './types/TScope';
import { TConditionalResponse, TOnResponse } from './types/messageDispatching';

type TMessageHandlers = Function[] | undefined;
type TFreeIDs = (number[] | undefined);

export class Context
  <
  TArchitecture extends ThreadArchitecture,
  TThread extends ThreadContext = "WorkerThread",
  TDispatchDirection extends CommunicationDirection = DispatchDirectionByContext<TThread>,
  TDispatchers extends OneWayMessageStructureType = TArchitecture[TDispatchDirection],
  THandleDirection extends CommunicationDirection = HandleDirectionByContext<TThread>,
  THandlers extends OneWayMessageStructureType = TArchitecture[THandleDirection]
  >
{
  static objectIdentifier = "object";
  static functionIdentifier = "function";

  messageHandlers: TMessageHandlers[] = [[]];
  responseHandlers: TMessageHandlers[] = [[]];
  freeResponseIDs: TFreeIDs[] = [[]];
  scope: TScope;

  constructor(scope: TScope, handlers: HandlerCollection<TArchitecture, THandleDirection>) {
    scope.onmessage = this.messageHandler;
    this.scope = scope;
    for (const key in handlers) {
      this.handle(parseInt(key), handlers[key]);
    }
  }

  static isPromise = (returnValue: any): boolean => {
    return typeof returnValue === Context.objectIdentifier && typeof returnValue?.then === Context.functionIdentifier
  };

  refresh = (scope: TScope) => {
    this.responseHandlers = [[]];
    this.freeResponseIDs = [[]];
    scope.onmessage = this.messageHandler;
    this.scope = scope;
  }

  handle = <TEventKey extends keyof THandlers & number>(
    event: TEventKey,
    handler: TConditionalHandler<THandlers, TEventKey>
  ) => {
    while (this.messageHandlers.length <= event) this.messageHandlers.push(undefined);
    this.messageHandlers[event]?.push(handler) ?? (this.messageHandlers[event] = [handler]);
  }

  private returnResponseID = (id: number, event: number) => {
    while (this.freeResponseIDs.length <= event) this.freeResponseIDs.push(undefined);
    this.freeResponseIDs[event]?.push(id) ?? (this.freeResponseIDs[event] = [id]);
    if (this.freeResponseIDs[event]?.length === this.responseHandlers[event]?.length) this.freeResponseIDs[event] = undefined;
  }

  messageHandler = async (ev: MessageEvent<TPostedMessage>): Promise<void> => {
    const { event, payload, responseID, isResponse } = ev.data;
    const messageType = responseID !== undefined ? isResponse ? EMessageType.Response : EMessageType.Call : EMessageType.OneWay
    switch (messageType) {
      case EMessageType.OneWay:
        for (let index = 0; index < (this.messageHandlers[event]?.length ?? 0); index++) ((this.messageHandlers[event] as Function[])[index] as Function)(payload);
        return;
      case EMessageType.Call:
        const result = ((this.messageHandlers[event] as Function[])[0] as Function)(payload);
        return Context.isPromise(result)
          ? (result as Promise<any>).then((resolved) => this.scope.postMessage({ event, payload: resolved, responseID, isResponse: true } as TPostedMessage))
          : this.scope.postMessage({ event, payload: result, responseID, isResponse: true } as TPostedMessage);
      case EMessageType.Response:
        return this.returnResponseID(((this.responseHandlers[event] as Function[])[responseID as number] as Function)(payload) as number, event);
    }
  }

  private addResponseHandler = <TEventKey extends keyof TDispatchers & number>(
    event: TEventKey,
    handler: TConditionalResponder<TDispatchers, TEventKey>
  ): number => {
    while (this.responseHandlers.length <= event) this.responseHandlers.push(undefined);
    const arr = this.responseHandlers[event] as Function[];
    if (!arr) {
      this.responseHandlers[event] = [handler];
      return 0;
    }
    const free = this.freeResponseIDs.length < event ? undefined : this.freeResponseIDs[event];
    if (!free || free.length === 0) {
      return ((arr?.push(handler) ?? 0) - 1);
    }
    const id = free?.pop() as number ?? -1;
    arr[id] = handler;
    return id;
  }

  dispatch = <TEventKey extends keyof TDispatchers & number>(
    event: TEventKey,
    payload: TDispatchers[TEventKey]['payload'],
    ...onResponse: TOnResponse<TDispatchers, TEventKey>
  ) => {
    onResponse.length > 0
      ? this.scope.postMessage({ event, payload, responseID: this.addResponseHandler<TEventKey>(event, onResponse[0] as any) } as TPostedMessage)
      : this.scope.postMessage({ event, payload } as TPostedMessage);
  }

  resolve = async <TEventKey extends TwoWayEvents<TDispatchers>>(
    event: TEventKey,
    payload: TDispatchers[TEventKey]['payload']): Promise<TConditionalResponse<TDispatchers, TEventKey>> => {
    return new Promise((resolve) => {
      this.scope.postMessage({ event, payload, responseID: this.addResponseHandler<TEventKey>(event, resolve as any) } as TPostedMessage);
    });
  }
}