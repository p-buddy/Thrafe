import Scope from "../development/Scope";

const notImplemented = (name: string) => {throw new Error(`Not implemented: ${name}`)};

export const mockWorkerContext: { worker: Worker, scope: Scope } = {
  worker: {
    onmessage: null,
    postMessage: (message) => {
      // @ts-ignore
      mockWorkerContext.scope.onmessage({ data: message });
    },
    addEventListener: () => notImplemented("addEventListener"),
    removeEventListener: () => notImplemented("removeEventListener"),
    onmessageerror: null,
    terminate: () => notImplemented("terminate"),
    dispatchEvent: () => notImplemented("dispatchEvent"),
    onerror: null
  },
  scope: {
    onmessage: null,
    postMessage: (message) => {
      // @ts-ignore
      mockWorkerContext.worker.onmessage({ data: message });
    }
  }
}