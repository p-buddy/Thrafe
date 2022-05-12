import { EMainToWorker } from "./mainToWorker";
import type { MainToWorker } from "./mainToWorker";
import { handle, initHandlers } from "./thrafe/messageHandling";
import type { DefineThread } from "./thrafe/messageStructure";
import { EWorkerToMain, type WorkerToMain } from "./workerToMain";
import { dispatch } from "./thrafe/messageDispatching";

export type Structure = DefineThread<"workerUnderTest", MainToWorker, WorkerToMain>;

initHandlers<Structure, "ToThread">(self, {
  [EMainToWorker.GetSquare]: async (value: number) => {
    const waitTime = Math.random() * 10000 + 1000;
    console.log(`Waiting ${waitTime / 1000}s to compute square of ${value}`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return value * value;
  },
  [EMainToWorker.SayHi]: (name: string) => {
    console.log(name);
    dispatch<WorkerToMain, EWorkerToMain.dummy>(self, EWorkerToMain.dummy, -1);
  },
  [EMainToWorker.Divide]: (payload: { dividend: number, divisor: number }) => {
    const { dividend, divisor } = payload;
    return dividend / divisor;
  },
  [EMainToWorker.GetCube]: async (base: number) => { return base * base }
});

dispatch<WorkerToMain, EWorkerToMain.dummy>(self, EWorkerToMain.dummy, 666);
