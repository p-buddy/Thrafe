import { Thrafe } from "./Thrafe";
import Scope from "./Scope"
import { AnyFunction, ThreadAPI } from "./types";

type HandlerLike = Record<number, AnyFunction>;

type APILike = {
  interface: Record<number, AnyFunction>
};

type Input = HandlerLike | APILike;

export class Handler<TInput extends Input> {
  private thrafe: Thrafe;
  interface: TInput extends APILike ? APILike['interface'] : TInput;

  constructor(handler: TInput & HandlerLike, scope?: Scope) {
    const thrafe = Thrafe.getInstance(scope ?? self);
    this.thrafe = thrafe;
    for (const key in handler) {
      thrafe.addEventHandler(parseInt(key), handler[key]);
    }
  }
}