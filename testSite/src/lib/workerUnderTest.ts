import { EMainToWorker } from "./mainToWorker";
import type { MainToWorker } from "./mainToWorker";
import { handle } from "./thrafe/messageHandling";
import type { DefineThreadMessaging } from "./thrafe/messageStructure";
import { EWorkerToMain, type WorkerToMain } from "./workerToMain";
import { dispatch } from "./thrafe/messageDispatching";

export type Structure = DefineThreadMessaging<"workerUnderTest", MainToWorker, WorkerToMain>;

handle<MainToWorker, EMainToWorker.GetSquare>(self, EMainToWorker.GetSquare, (value: number) => {
  return value * value;
});

handle<MainToWorker, EMainToWorker.SayHi>(self, EMainToWorker.SayHi, (name: string) => {
  console.log(name);
  dispatch<WorkerToMain, EWorkerToMain.dummy>(self, EWorkerToMain.dummy, undefined);
});

