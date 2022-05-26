import TScope from "../development/types/TScope";
import * as chai from 'chai';

export const mockWorkerContext: { worker: Worker, scope: TScope } = {
  worker: {
    onmessage: undefined,
    postMessage: (message) => {
      // @ts-ignore
      mockWorkerContext.scope.onmessage({ data: message });
    },
    addEventListener: undefined,
    removeEventListener: undefined,
    onmessageerror: undefined,
    terminate: undefined,
    dispatchEvent: undefined,
    onerror: undefined
  },
  scope: {
    onmessage: undefined,
    postMessage: (message) => {
      // @ts-ignore
      mockWorkerContext.worker.onmessage({ data: message });
    }
  }
}