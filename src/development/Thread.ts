import { Dispatcher } from "./Dispatcher";
import { Handler } from "./Handler";
import Scope from "./Scope";
import { Thrafe } from "./Thrafe";
import { WorkerThreadAPI } from "./types";

export class Thread<TApi extends WorkerThreadAPI<any, any, any>> {
  private src: string;
  private worker: Worker;
  private dispatcher;
  private handler;
  thrafe?: Thrafe;

  constructor(workerName: TApi['name'], testWorker: Worker = undefined) {
    this.src = `${workerName}.js`;
    const worker = testWorker ?? new Worker(this.src);
    this.worker = worker;
  }

  getDispatcher<TEvents extends keyof TApi['interface']>(): Dispatcher<TApi> {
    this.dispatcher = new Dispatcher<TApi>(this.worker);
    return this.dispatcher;
  }

  attachHandler<THandler extends Record<number, (...args: any) => any>>(handler: THandler): Handler<THandler> {
    this.handler = new Handler<THandler>(handler, this.worker);
    return this.handler;
  }

  close() {
    Thrafe.dispose(this.worker);
    this.worker.terminate();
    this.dispatcher = undefined;
    this.handler = undefined;
  }

  restart() {
    const handler = this.handler;
    this.close();
    const thread = new Thread<TApi>(this.src);
    thread.attachHandler(handler);
    return { thread, dispatcher: thread.getDispatcher<keyof TApi>() };
  }

  clone() {
    const thread = new Thread(this.src);
    const dispatcher = thread.getDispatcher();
    thread.attachHandler(this.handler);
    return { thread, dispatcher };
  }
}