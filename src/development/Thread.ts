import type { OneWayEvents, ThreadArchitectureType as ThreadStructure, TwoWayEvents } from './messageStructure';
import { dispatch, resolve } from './messageDispatching';
import type { TOnResponse } from './messageDispatching';
import { handle, initHandlers, type HandlerCollection } from './messageHandling';
import type { TConditionalHandler } from './messageHandling';

export class Thread<T extends ThreadStructure> {
  private src: string;
  private worker: Worker;
  private handlers: HandlerCollection<T, "FromThread">;

  constructor(workerName: T['Name'], handlers: HandlerCollection<T, "FromThread">) {
    this.src = `${workerName}.js`;
    this.handlers = handlers;
    const worker = new Worker(this.src);
    initHandlers<T, "FromThread">(worker, handlers);
    this.worker = worker;
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
    initHandlers(worker, this.handlers);
    this.worker = worker;
  }
}

