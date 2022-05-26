import type { CommunicationDirection, DispatchDirectionByContext, HandleDirectionByContext, OneWayEvents, OneWayMessageStructureType, ThreadArchitecture, TwoWayEvents } from './types/messageStructure';
import type { TOnResponse } from './types/messageDispatching';
import type { TConditionalHandler, HandlerCollection } from './types/messageHandling';
import { Context } from './Context';

export class Thread<
  TArchitecture extends ThreadArchitecture,
  TDispatchDirection extends CommunicationDirection = DispatchDirectionByContext<"MainThread">,
  TDispatchers extends OneWayMessageStructureType = TArchitecture[TDispatchDirection],
  THandleDirection extends CommunicationDirection = HandleDirectionByContext<"MainThread">,
  THandlers extends OneWayMessageStructureType = TArchitecture[THandleDirection]
  > {
  private src: string;
  private worker: Worker;
  private context: Context<TArchitecture, "MainThread">;

  static Start<T extends ThreadArchitecture>(workerName: T['Name'], handlers: HandlerCollection<T, "FromThread">): Thread<T> {
    return new Thread(workerName, handlers);
  }

  static Test<T extends ThreadArchitecture>(workerName: T['Name'], handlers: HandlerCollection<T, "FromThread">, testWorker: Worker): Thread<T> {
    return new Thread(workerName, handlers, testWorker);
  }

  private constructor(workerName: TArchitecture['Name'], handlers: HandlerCollection<TArchitecture, "FromThread">, testWorker: Worker = undefined) {
    this.src = `${workerName}.js`;
    const worker = testWorker ?? new Worker(this.src);
    this.context = new Context<TArchitecture, "MainThread">(worker, handlers);
    this.worker = worker;
  }

  dispatch<TEventKey extends keyof TDispatchers & number>(
    event: TEventKey,
    payload: TDispatchers[TEventKey]['payload'],
    ...onResponse: TOnResponse<TDispatchers, TEventKey>) {
    this.context.dispatch(event, payload, ...onResponse);
  }

  async resolve<TEventKey extends TwoWayEvents<TArchitecture[TDispatchDirection]>>(
    event: TEventKey,
    payload: TDispatchers[TEventKey]['payload'],
  ) {
    return this.context.resolve<TEventKey>(event, payload);
  }

  handle<TEventKey extends OneWayEvents<THandlers>>(event: TEventKey, handler: TConditionalHandler<THandlers, TEventKey>) {
    this.context.handle(event, handler);
  }

  close() {
    this.worker.terminate();
  }

  restart() {
    this.worker.terminate();
    const worker = new Worker(this.src);
    this.context.refresh(worker);
    this.worker = worker;
  }
}

