import { attachHandler, getDispatcher, type WorkerThreadAPI, type MainThreadAPI, type Handler } from "thrafe";

export type FromThreadAPI = MainThreadAPI<EWorkerToMain, Handler<{
  0: (p: any) => void;
  1: (p: any) => number;
}>>;

export const enum EWorkerToMain {
  dummy,
}

export type ToThreadAPI = WorkerThreadAPI<"testWorker", EMainToWorker, typeof handler>;

export const enum EMainToWorker {
  SayHi,
  GetSquare,
  GetCube,
  Divide,
}

const dispatcher = getDispatcher();
const handler = attachHandler({
  [EMainToWorker.GetCube]: async (a: number) => {
    await Promise.resolve();
    return a * a * a;
  },
  [EMainToWorker.Divide]: (a: number, b: number): number => {
    return a / b;
  },

  [EMainToWorker.GetSquare]: (a: number) => {
    //dispatcher.request(EMainToWorker.Divide, 3, 3);
    return a * a;
  },
  [EMainToWorker.SayHi]: () => {
    console.log('hello from a thread!');
  }
});


/*

x.dispatch();

const y = new x();

context.dispatch()

context.dispatch(EWorkerToMain.dummy, 666);
*/
