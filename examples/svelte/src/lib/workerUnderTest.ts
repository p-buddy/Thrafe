import { EMainToWorker, type MainToWorker } from "./mainToWorker";
import { EWorkerToMain, type WorkerToMain } from "./workerToMain";
import { Context, type DefineThreadArchitecture } from "thrafe";

export type Structure = DefineThreadArchitecture<"testWorker", MainToWorker, WorkerToMain>;

const context = new Context<Structure>(self, {
  [EMainToWorker.GetSquare]: async (value: number) => {
    const waitTime = Math.random() * 10000 + 1000;
    console.log(`Waiting ${waitTime / 1000}s to compute square of ${value}`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return value * value;
  },
  [EMainToWorker.SayHi]: (name: string) => {
    console.log(name);
    context.dispatch<EWorkerToMain.dummy>(EWorkerToMain.dummy, -1);
  },
  [EMainToWorker.Divide]: (payload: { dividend: number, divisor: number }) => {
    const { dividend, divisor } = payload;
    return dividend / divisor;
  },
  [EMainToWorker.GetCube]: async (base: number) => { return base * base }
});

context.dispatch(EWorkerToMain.dummy, 666);
