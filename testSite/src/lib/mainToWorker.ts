import type { DefineMessageStructure } from './thrafe/messageStructure';
export const enum EMainToWorker {
  SayHi,
  GetSquare,
}

export type MainToWorker = DefineMessageStructure<EMainToWorker, {
  [EMainToWorker.SayHi]: { payload: string },
  [EMainToWorker.GetSquare]: { payload: number, response: number }
}>;