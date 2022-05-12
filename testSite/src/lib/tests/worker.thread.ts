import { initHandlers } from "$lib/thrafe/messageHandling";
import type { DefineOneWayMessageStructure, DefineThread } from "$lib/thrafe/messageStructure";

export const enum EMainToWorker {
  GetSquare,
  GetCube,
  Divide,
}

export type MainToWorker = DefineOneWayMessageStructure<EMainToWorker, {
  [EMainToWorker.GetSquare]: { payload: number, response: number },
  [EMainToWorker.GetCube]: { payload: number, response: number },
  [EMainToWorker.Divide]: { payload: { dividend: number, divisor: number }, response: number },
}>;

export type Structure = DefineThread<"workerUnderTest", MainToWorker, never>;

//initHandlers<Structure, "ToThread">(self, {});