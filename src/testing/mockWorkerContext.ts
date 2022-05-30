import Scope from "../development/Scope";
import * as chai from 'chai';

export const mockWorkerContext: { worker: Worker, scope: Scope } = {
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