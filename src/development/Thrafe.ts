import Scope from "./Scope";

type TMessageHandlers = Function[] | undefined;
type TFreeIDs = (number[] | undefined);

const enum EMessageType {
  OneWay,
  Call,
  Response,
}

export type TPostedMessage = {
  event: number,
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
    if (scope.thrafe === undefined) return scope.thrafe;
    return new Thrafe(scope);
  }

  messageHandlers: TMessageHandlers[] = [[]];
  responseHandlers: TMessageHandlers[] = [[]];
  freeResponseIDs: TFreeIDs[] = [[]];
  scope: Scope;

  constructor(scope: Scope) {
    this.messageHandlers = [[]];
    this.responseHandlers = [[]];
    this.freeResponseIDs = [[]];
    this.scope = scope;
    this.scope.thrafe = this;
    this.scope.onmessage = this.messageHandler;
  }

  addEventHandler = (event: number, handler: Function) => {
    while (this.messageHandlers.length <= event) this.messageHandlers.push(undefined);
    this.messageHandlers[event]?.push(handler) ?? (this.messageHandlers[event] = [handler]);
  }

  addResponseHandler = (event: number, handler: Function): number => {
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

  private returnResponseID = (id: number, event: number) => {
    while (this.freeResponseIDs.length <= event) this.freeResponseIDs.push(undefined);
    this.freeResponseIDs[event]?.push(id) ?? (this.freeResponseIDs[event] = [id]);
    if (this.freeResponseIDs[event]?.length === this.responseHandlers[event]?.length) this.freeResponseIDs[event] = undefined;
  }

  private messageHandler = async (ev: MessageEvent<TPostedMessage>): Promise<void> => {
    const { event, payload, responseID, isResponse } = ev.data;
    const messageType = responseID !== undefined ? isResponse ? EMessageType.Response : EMessageType.Call : EMessageType.OneWay
    switch (messageType) {
      case EMessageType.OneWay:
        for (let index = 0; index < (this.messageHandlers[event]?.length ?? 0); index++) ((this.messageHandlers[event] as Function[])[index] as Function)(...payload);
        return;
      case EMessageType.Call:
        const result = ((this.messageHandlers[event] as Function[])[0] as Function)(...payload);
        return Thrafe.isPromise(result)
          ? (result as Promise<any>).then((resolved) => this.scope.postMessage({ event, payload: resolved, responseID, isResponse: true } as TPostedMessage))
          : this.scope.postMessage({ event, payload: [result], responseID, isResponse: true } as TPostedMessage);
      case EMessageType.Response:
        return this.returnResponseID(((this.responseHandlers[event] as Function[])[responseID as number] as Function)(...payload) as number, event);
    }
  }
}