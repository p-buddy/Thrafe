import type { DefineOneWayMessageStructure } from './thrafe/messageStructure';
export const enum EMainToWorker {
  SayHi,
  GetSquare,
}

export type MainToWorker = DefineOneWayMessageStructure<EMainToWorker, {
  [EMainToWorker.SayHi]: { payload: string },
  [EMainToWorker.GetSquare]: { payload: number, response: number }
}>;