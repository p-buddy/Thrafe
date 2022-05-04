import type { OneWayMessageStructureType, PayloadType, ResponseType, ThreadMessageType as ThreadStructure } from './messageStructure';
import { dispatch } from './messageDispatching';
import type { TOnResponse } from './messageDispatching';
import { handle } from './messageHandling';
import type { TConditionalHandler } from './messageHandling';

type AsNumber<T> = T & number;
type HandlerCollection<T extends ThreadStructure> = {
  [Key in keyof T['FromThread']]:
  TConditionalHandler<T['FromThread'], AsNumber<Key>> };
type TKeysNotMatching<TBase, TQueryType> = {
  [K in keyof TBase]-?: TBase[K] extends TQueryType ? never : K
}[keyof TBase];
type OneWayEvents<T extends ThreadStructure> = number & TKeysNotMatching<T['FromThread'], ResponseType<any>>;

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

  handle<TEventKey extends OneWayEvents<T>>(event: TEventKey, handler: TConditionalHandler<T['FromThread'], TEventKey>) {
    handle(this.worker, event, handler);
  }

  terminate() {
    this.worker.terminate();
  }

  restart() {
    this.terminate();
    const worker = new Worker(this.src);
    Thread.applyHandlers<T>(worker, this.handlers);
    this.worker = worker;
  }
}

export default Thread;