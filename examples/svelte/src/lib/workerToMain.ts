import type { DefineOneWayMessageStructure } from 'thrafe';
export const enum EWorkerToMain {
  dummy,
  responseful
}

export type WorkerToMain = DefineOneWayMessageStructure<EWorkerToMain, {
  [EWorkerToMain.dummy]: { payload: number },
  [EWorkerToMain.responseful]: { payload: number, response: number }
}>;