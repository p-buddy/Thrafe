import type { Dispatcher } from "./Dispatcher";
import type { Handler } from "./Handler";
import { Thread } from "./Thread";

export type AnyFunction = ((...args: any) => any);

export type API<T> = Record<keyof T, AnyFunction> & { name?: string };

export type FunctionContainer = Record<symbol | string | number, AnyFunction>;

export type Events<T extends API<any>> = Omit<T, "name">;

export type ThreadCommunication = { name: string, toThread: FunctionContainer, fromThread: FunctionContainer };

export type ThreadAPI<
  TName extends string,
  TCommunicationOutOfThread extends Dispatcher<FunctionContainer>,
  TCommunicationToThread extends Handler<FunctionContainer>
  >
  = { name: TName, toThread: TCommunicationToThread['events'], fromThread: TCommunicationOutOfThread['events'] };
  
export type To<TThread extends Thread<any>> = Dispatcher<TThread['toThread']>;
export type From<TThread extends Thread<any>> = Handler<TThread['fromThread']>;