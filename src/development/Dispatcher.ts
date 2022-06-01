import { Thrafe, type TPostedMessage } from "./Thrafe";
import type { AnyFunction, Events, API } from "./types";
import type Scope from "./Scope";
import { Handler } from "./Handler";

type ArgsAndResponseCallback<TFunc extends AnyFunction> = [...args: Parameters<TFunc>, onResponse: (response: ReturnType<TFunc>) => void];

type OneWayKeys<TBase extends { [k in keyof TBase]: AnyFunction }> = {
  [K in keyof TBase]-?: ReturnType<TBase[K]> extends void ? K : never
}[keyof TBase] & keyof TBase & number;

type CallAndResponseKeys<TBase extends { [k in keyof TBase]: AnyFunction }> = {
  [K in keyof TBase]-?: ReturnType<TBase[K]> extends void ? never : K
}[keyof TBase] & keyof TBase & number;



export class Dispatcher<TApi extends API<TApi>> {
  private thrafe: Thrafe;
  private postMessage: Scope['postMessage'];

  constructor(scope?: Scope) {
    this.postMessage = (scope ?? self).postMessage;
    this.thrafe = Thrafe.getInstance(scope ?? self);
  }

  send<TEventKey extends OneWayKeys<Events<TApi>>>(
    event: TEventKey,
    ...args: Parameters<TApi[TEventKey]>) {
    this.postMessage({ event, payload: args } as TPostedMessage);
  }

  request<TEventKey extends CallAndResponseKeys<Events<TApi>>>(
    event: TEventKey,
    ...args: ArgsAndResponseCallback<TApi[TEventKey]>
  ) {
    const onResponse = args.pop();
    this.postMessage({ event, payload: args, responseID: this.thrafe.addResponseHandler(event, onResponse as any) } as TPostedMessage)
  }

  resolve<TEventKey extends CallAndResponseKeys<Events<TApi>>>(
    event: TEventKey,
    ...args: Parameters<TApi[TEventKey]>): Promise<ReturnType<TApi[TEventKey]>> {
    return new Promise((resolve) => {
      this.postMessage({ event, payload: args, responseID: this.thrafe.addResponseHandler(event, resolve) } as TPostedMessage);
    });
  }
}

