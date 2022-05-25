import TScope from "../development/TScope";
import * as chai from 'chai';

export const mockWorkerContext: { worker: Worker, context: TScope } = {
  worker: {
    onmessage: undefined,
    postMessage: (message) => {
      console.log('w');
      // @ts-ignore
      mockWorkerContext.context.onmessage({ data: message });
    },
    addEventListener: undefined,
    removeEventListener: undefined,
    onmessageerror: undefined,
    terminate: undefined,
    dispatchEvent: undefined,
    onerror: undefined
  },
  context: {
    onmessage: undefined,
    postMessage: (message) => {
      console.log('c');
      // @ts-ignore
      mockWorkerContext.worker.onmessage({ data: message });
    }
  }
}