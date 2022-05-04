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
  private worker;

  constructor(workerSrc: T['Name'], handlers: HandlerCollection<T>) {
    this.worker = new Worker(`${workerSrc}.js`);
    for (const key in handlers) {
      handle(this.worker, parseInt(key), handlers[key]);
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
}

export default Thread;