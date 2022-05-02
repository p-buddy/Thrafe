import type { DefineMessageStructure } from './thrafe/messageStructure';
export const enum EWorkerToMain {
  dummy
}

export type WorkerToMain = DefineMessageStructure<EWorkerToMain, {
  [EWorkerToMain.dummy]: { payload: undefined }
}>;