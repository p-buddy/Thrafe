import type { Handler } from "./Handler";

export type AnyFunction = ((...args: any) => any);

export type WorkerThreadAPI<
  TName extends string,
  TEvents extends number,
  THandler extends Handler<Record<TEvents, AnyFunction>>
  >
  = { interface: THandler['interface'], name: TName };

export type MainThreadAPI<
  TEvents extends number,
  THandler extends Handler<Record<TEvents, AnyFunction>>
  >
  = { interface: THandler['interface'] };

export type ThreadAPI<
  TEvents extends number,
  THandler extends Handler<Record<TEvents, AnyFunction>>
  >
  = { interface: THandler['interface'] };