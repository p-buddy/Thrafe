import { Dispatcher } from "./Dispatcher";
import { Handler } from "./Handler";
import { Thrafe } from "./Thrafe";
import { FunctionContainer, ThreadCommunication } from "./types";
import { attachHandler } from "./workerFunctions";

export class Thread<TApi extends ThreadCommunication> {
  toThread: TApi['toThread'];
  fromThread: TApi['fromThread'];
  private src: string;
  private worker: Worker;
  private dispatcher;
  private handler;
  thrafe?: Thrafe;

  static Make
    <TComms extends ThreadCommunication>(workerName: TComms['name'], handles: TComms['fromThread'])
    : [thread: Thread<TComms>, dispatcher: Dispatcher<TComms['toThread']>, handler: Handler<TComms['fromThread']>] {
    const thread = new Thread<TComms>(workerName);
    const dispatcher = thread.getDispatcher<TComms['toThread']>();
    const handler = attachHandler<TComms['fromThread']>(handles);
    return [thread, dispatcher, handler];
  }

  constructor(workerName: TApi['name'], testWorker: Worker = undefined) {
    this.src = `${workerName}.js`;
    this.worker = testWorker !== undefined ? testWorker : new Worker(this.src);
  }

  getDispatcher<TEvents extends TApi['toThread']>(): Dispatcher<TEvents> {
    this.dispatcher = new Dispatcher<TEvents>(this.worker);
    return this.dispatcher;
  }

  attachHandler<TEvents extends TApi['fromThread']>(handler: TEvents): Handler<TEvents> {
    this.handler = new Handler<TEvents>(handler, this.worker);
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
    return { thread, dispatcher: thread.getDispatcher<TApi['toThread']>() };
  }

  clone() {
    const thread = new Thread(this.src);
    const dispatcher = thread.getDispatcher();
    thread.attachHandler(this.handler);
    return { thread, dispatcher };
  }
}