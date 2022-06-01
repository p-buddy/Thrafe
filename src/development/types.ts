import type { Handler } from "./Handler";

export type AnyFunction = ((...args: any) => any);

export type API<T> = Record<number & keyof T, AnyFunction> & { name?: string };

export type Events<T extends API<any>> = Omit<T, "name">;

export type WorkerThreadAPI<
  TName extends string,
  TEvents extends number,
  THandler extends Handler<Record<TEvents, AnyFunction>>
  >
  = Events<API<THandler['events']>> & { name: TName };

export type MainThreadAPI<
  TEvents extends number,
  THandler extends Handler<Record<TEvents, AnyFunction>>
  >
  = Omit<API<THandler['events']>, "name">;