import { Dispatcher } from "./Dispatcher"
import { Handler } from "./Handler";
import type Scope from "./Scope";
import type { FunctionContainer } from "./types"

let overrideChecks = false;
export const setTestOverride = () => { overrideChecks = true };

const isWorker = () => {
  // @ts-ignore
  return (typeof WorkerGlobalScope !== "undefined") && (typeof importScripts === "function") && (navigator instanceof WorkerNavigator);
}

const checkForMainThread = (func: Function) => {
  if (!isWorker() && !overrideChecks) throw new Error(`${func.name} should not be called from the main thread. Instead, construct a new Thread and call the member function of the same name.`);
}

export const getDispatcher = <TApi extends FunctionContainer>(scope?: Scope): Dispatcher<TApi> => {
  checkForMainThread(getDispatcher);
  return new Dispatcher(scope);
}

export const attachHandler = <THandler extends FunctionContainer>(handler: THandler, scope?: Scope): Handler<THandler> => {
  checkForMainThread(attachHandler);
  return new Handler(handler, scope);
}