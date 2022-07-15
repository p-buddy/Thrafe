import Scope from "./Scope";

type MessageHandlers = Function[] | undefined;
type HandlerCollection = Record<string | number | symbol, MessageHandlers>;
type FreeIDs = (number[] | undefined);

const enum EMessageType {
  OneWay,
  Call,
  Response,
}

export type TPostedMessage = {
  event: number | string | symbol,
  payload: Array<any>,
  isResponse?: boolean,
  responseID?: number,
}

export class Thrafe {
  static undefinedIdentifier = "undefined";
  static objectIdentifier = "object";
  static functionIdentifier = "function";

  static isPromise = (returnValue: any): boolean => {
    return typeof returnValue === Thrafe.objectIdentifier && typeof returnValue?.then === Thrafe.functionIdentifier
  };

  static getInstance = (scope: Scope): Thrafe => {
    const existing = scope.thrafe;
    if (existing !== undefined) return existing;
    return new Thrafe(scope);
  }

  static dispose(scope: Scope) {
    const existing = scope.thrafe;
    if (existing === undefined) return;
    scope.thrafe = scope.onmessage = existing.messageHandlers = existing.freeResponseIDs = existing.responseHandlers = existing.scope = null;
  }

  private messageHandlers: HandlerCollection;
  private responseHandlers: HandlerCollection;
  private freeResponseIDs: Record<string | number | symbol, FreeIDs>;
  scope: Scope;

  constructor(scope: Scope) {
    this.messageHandlers = {};
    this.responseHandlers = {};
    this.freeResponseIDs = {};
    this.scope = scope;
    this.scope.thrafe = this;
    this.scope.onmessage = this.messageHandler;
  }

  addEventHandler = (event: number | string | symbol, handler: Function) =>
   this.messageHandlers[event]?.push(handler) ?? (this.messageHandlers[event] = [handler]);

  addResponseHandler = (event: number | string | symbol, handler: Function): number => {
    const handlers = this.responseHandlers[event] as Function[];
    if (!handlers) {
      this.responseHandlers[event] = [handler];
      return 0;
    }
    const free = this.freeResponseIDs[event];
    if (!free || free.length === 0) return ((handlers?.push(handler) ?? 0) - 1);
    const id = free?.pop() as number ?? -1;
    handlers[id] = handler;
    return id;
  }

  private returnResponseID = (id: number, event: number | string | symbol) => {
    this.freeResponseIDs[event]?.push(id) ?? (this.freeResponseIDs[event] = [id]);
    if (this.freeResponseIDs[event]?.length === this.responseHandlers[event]?.length) this.freeResponseIDs[event] = undefined;
  }

  private messageHandler = async (ev: MessageEvent<TPostedMessage>): Promise<void> => {
    const { event, payload, responseID, isResponse } = ev.data;
    const messageType = responseID !== undefined ? isResponse ? EMessageType.Response : EMessageType.Call : EMessageType.OneWay;
    const handlers: Function[] = (messageType === EMessageType.Response) ? this.responseHandlers[event] :this.messageHandlers[event];
    switch (messageType) {
      case EMessageType.OneWay:
        for (let index = 0; index < (handlers?.length ?? 0); index++) handlers[index](...payload);
        return;
      case EMessageType.Call:
        const result = handlers[0](...payload);
        return Thrafe.isPromise(result)
          ? (result as Promise<any>).then((resolved) => this.scope.postMessage({ event, payload: resolved, responseID, isResponse: true } as TPostedMessage))
          : this.scope.postMessage({ event, payload: [result], responseID, isResponse: true } as TPostedMessage);
      case EMessageType.Response:
        return this.returnResponseID((handlers[responseID])(...payload), event);
    }
  }
}