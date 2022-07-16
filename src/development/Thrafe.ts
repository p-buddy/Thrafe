import Scope from "./Scope";

type MessageHandlers = Function[] | undefined;
type HandlerCollection = Map<string | number | symbol, MessageHandlers>;
type IDCollection = Map<string | number | symbol, FreeIDs>;
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
    return existing ?? new Thrafe(scope);
  }

  static dispose(scope: Scope) {
    const existing = scope.thrafe;
    if (existing === undefined) return;
    scope.thrafe = scope.onmessage = existing.messageHandlers = existing.freeResponseIDs = existing.responseHandlers = existing.scope = null;
  }

  private messageHandlers: HandlerCollection;
  private responseHandlers: HandlerCollection;
  private freeResponseIDs: IDCollection;
  scope: Scope;

  constructor(scope: Scope) {
    this.messageHandlers = new Map();
    this.responseHandlers = new Map();
    this.freeResponseIDs = new Map();
    this.scope = scope;
    this.scope.thrafe = this;
    this.scope.onmessage = this.messageHandler;
  }

  addEventToCollectionAndGetIndex = <T>(collection: Map<number | string | symbol, T[]>, event: number | string | symbol, item: T): number => {
    if (collection.has(event)) return collection.get(event).push(item) - 1;
    collection.set(event, [item]);
    return 0;
  }

  addEventHandler = (event: number | string | symbol, handler: Function) => {
    this.messageHandlers.has(event) ? this.messageHandlers.get(event).push(handler) : this.messageHandlers.set(event, [handler]);
  }

  addResponseHandler = (event: number | string | symbol, handler: Function): number => {
    if (!this.responseHandlers.has(event)) {
      this.responseHandlers.set(event, [handler]);
      return 0;
    }
    const handlers = this.responseHandlers.get(event);
    const free = this.freeResponseIDs.get(event);
    if (free === undefined || free.length === 0) return (handlers.push(handler) ?? 0) - 1;
    const id = free?.pop() ?? -1;
    handlers[id] = handler;
    return id;
  }

  private returnResponseID = (id: number, event: number | string | symbol) => {
    this.freeResponseIDs.has(event) ? this.freeResponseIDs.get(event).push(id) : this.freeResponseIDs.set(event, [id]);
    if (this.freeResponseIDs.get(event)?.length === this.responseHandlers.get(event)?.length) this.freeResponseIDs.set(event, undefined);
  }

  private messageHandler = async (ev: MessageEvent<TPostedMessage>): Promise<void> => {
    const { event, payload, responseID, isResponse } = ev.data;
    const messageType = responseID !== undefined ? isResponse ? EMessageType.Response : EMessageType.Call : EMessageType.OneWay;
    const handlers: Function[] = (messageType === EMessageType.Response) ? this.responseHandlers.get(event) :this.messageHandlers.get(event);
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