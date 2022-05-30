import { Thrafe } from "./Thrafe";
import Scope from "./Scope"

export class Handler<THandler extends Record<number, (...args: any) => any>> {
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