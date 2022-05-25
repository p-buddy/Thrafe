import type { DefineOneWayMessageStructure } from './thrafe/messageStructure';
export const enum EMainToWorker {
  SayHi,
  GetSquare,
  GetCube,
  Divide,
}

export type MainToWorker = DefineOneWayMessageStructure<EMainToWorker, {
  [EMainToWorker.SayHi]: { payload: string },
  [EMainToWorker.GetSquare]: { payload: number, response: number },
  [EMainToWorker.GetCube]: { payload: number, response: number },
  [EMainToWorker.Divide]: { payload: { dividend: number, divisor: number }, response: number },
}>;