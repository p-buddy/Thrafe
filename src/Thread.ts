import type { MessageStructureType, ThreadMessageType } from './messageStructure';
import { dispatch } from './messageDispatching';
import type { TOnResponse } from './messageDispatching';
import { handle } from './messageHandling';
import type { TConditionalHandler } from './messageHandling';

class Thread<T extends ThreadMessageType> {
  private worker;

  constructor(workerSrc: T['Name']) {
    this.worker = new Worker(workerSrc);
  }

  dispatch<TEventKey extends keyof T['ToThread'] & number>(
    event: TEventKey,
    payload: T['ToThread'][TEventKey]['payload'],
    ...onResponse: TOnResponse<T['ToThread'], TEventKey>) {
    dispatch(this.worker, event, payload, ...onResponse);
  }

  handle<TEventKey extends keyof T['FromThread'] & number>(event: TEventKey, handler: TConditionalHandler<T['FromThread'], TEventKey>) {
    handle(this.worker, event, handler);
  }
}

export default Thread;