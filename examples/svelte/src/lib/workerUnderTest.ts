import { EMainToWorker, type MainToWorker } from "./mainToWorker";
import { EWorkerToMain, type WorkerToMain } from "./workerToMain";
import { Context, type DefineThreadArchitecture } from "thrafe";

export type Structure = DefineThreadArchitecture<"testWorker", x, x>;

type Handler<T extends number> = Record<T, Function>;
const context: Context<Structure> = new Context<Structure>(new x());

class x implements Handler<EMainToWorker> {
  async [EMainToWorker.GetCube](a: number) {
    await Promise.resolve();
    return a * a * a;
  }

  [EMainToWorker.Divide](a: number, b: number): number {
    return a / b;
  }

  [EMainToWorker.GetSquare](a: number) {
    context.dispatch(EMainToWorker.Divide, 3, 3);
    return a * a;
  }

  [EMainToWorker.SayHi]() {
    console.log('hello from a thread!');
  }
}



x.dispatch();

const y = new x();

context.dispatch()
new x()[EMainToWorker.GetSquare]();

const contextA = new Context<Structure>(self, {
  [EMainToWorker.GetSquare]: async (value: number) => {
    const waitTime = Math.random() * 10000 + 1000;
    console.log(`Waiting ${waitTime / 1000}s to compute square of ${value}`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return value * value;
  },
  [EMainToWorker.SayHi]: (name: string) => {
    console.log(name);
    context.dispatch(EWorkerToMain.dummy, -1);
  },
  [EMainToWorker.Divide]: (payload: { dividend: number, divisor: number }) => {
    const { dividend, divisor } = payload;
    return dividend / divisor;
  },
  [EMainToWorker.GetCube]: async (base: number) => { return base * base }
});

context.dispatch(EWorkerToMain.dummy, 666);
