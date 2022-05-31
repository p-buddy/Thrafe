import { Thrafe } from "./Thrafe";
import Scope from "./Scope"
import { AnyFunction } from "./types";

export class Handler<THandler extends Record<number, AnyFunction>> {
  private thrafe: Thrafe;
  interface: THandler;

  constructor(handler: THandler, scope?: Scope) {
    const thrafe = Thrafe.getInstance(scope ?? self);
    this.thrafe = thrafe;
    for (const key in handler) {
      thrafe.addEventHandler(parseInt(key), handler[key]);
    }
  }
}