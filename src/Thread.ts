import type { MessageStructureType } from './messageStructure';
import { dispatch } from './messageDispatching';
import type { TOnResponse } from './messageDispatching';
import { handle } from './messageHandling';
import type { TConditionalHandler } from './messageHandling';

class Thread<ToThread extends MessageStructureType, FromThread extends MessageStructureType> {
  private worker;

  constructor(workerSrc: string) {
    this.worker = new Worker(workerSrc);
  }

  dispatch<TEventKey extends keyof ToThread & number>(
    event: TEventKey,
    payload: ToThread[TEventKey]['payload'],
    ...onResponse: TOnResponse<ToThread, TEventKey>) {
    dispatch(this.worker, event, payload, ...onResponse);
  }

  handle<TEventKey extends keyof FromThread & number>(event: TEventKey, handler: TConditionalHandler<FromThread, TEventKey>) {
    handle(this.worker, event, handler);
  }
}

export default Thread;