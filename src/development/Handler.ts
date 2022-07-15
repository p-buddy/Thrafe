import { Thrafe } from "./Thrafe";
import Scope from "./Scope"
import { API } from "./types";

export class Handler<TInput extends API<TInput>> {
  private thrafe: Thrafe;
  events: TInput;

  constructor(handler: TInput, scope?: Scope) {
    const thrafe = Thrafe.getInstance(scope ?? self);
    this.thrafe = thrafe;
    for (const key in handler) {
      thrafe.addEventHandler(key, handler[key]);
    }
  }
}