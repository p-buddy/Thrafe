import type { AsNumber, OneWayEvents, ThreadMessageType as ThreadStructure, TwoWayEvents } from './messageStructure';
import { dispatch, resolve } from './messageDispatching';
import type { TOnResponse } from './messageDispatching';
import { handle } from './messageHandling';
import type { TConditionalHandler } from './messageHandling';

export type HandlerCollection<T extends ThreadStructure> = {
  [Key in keyof T['FromThread']]:
  TConditionalHandler<T['FromThread'], AsNumber<Key>> };

class Thread<T extends ThreadStructure> {
  private src: string;
  private worker: Worker;
  private handlers: HandlerCollection<T>;

  constructor(workerName: T['Name'], handlers: HandlerCollection<T>) {
    this.src = `${workerName}.js`;
    this.handlers = handlers;
    const worker = new Worker(this.src);
    Thread.applyHandlers<T>(worker, handlers);
    this.worker = worker;
  }

  private static applyHandlers<T extends ThreadStructure>(worker: Worker, handlers: HandlerCollection<T>) {
    for (const key in handlers) {
      handle(worker, parseInt(key), handlers[key]);
    }
  }

  dispatch<TEventKey extends keyof T['ToThread'] & number>(
    event: TEventKey,
    payload: T['ToThread'][TEventKey]['payload'],
    ...onResponse: TOnResponse<T['ToThread'], TEventKey>) {
    dispatch(this.worker, event, payload, ...onResponse);
  }

  async resolve<TEventKey extends TwoWayEvents<T['ToThread']>>(
    event: TEventKey,
    payload: T['ToThread'][TEventKey]['payload'],
  ) {
    return resolve(this.worker, event, payload);
  }

  handle<TEventKey extends OneWayEvents<T['FromThread']>>(event: TEventKey, handler: TConditionalHandler<T['FromThread'], TEventKey>) {
    handle(this.worker, event, handler);
  }

  close() {
    this.worker.terminate();
  }

  restart() {
    this.close();
    const worker = new Worker(this.src);
    Thread.applyHandlers<T>(worker, this.handlers);
    this.worker = worker;
  }
}

export default Thread;