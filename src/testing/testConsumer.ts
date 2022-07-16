import { Thread } from "../development/Thread";
import { From, To } from "../development/types";
import { mockWorkerContext } from "./mockWorkerContext";
import { runTest, setUp, TestContext } from "./testingUtility";
import type { API } from "./testWorker";

export const enum FromThreadEvents {
  sendNumberOutAndGetBack
}

let dispatcher: To<Thread<API>>;
let handler: From<Thread<API>>;

export const testContext: TestContext = {
  init: () => {
    const thread = new Thread<API>("testWorkerThread", mockWorkerContext.worker);
    [dispatcher, handler] = setUp(testContext, mockWorkerContext.worker, thread);
  },
  test: async () => {
    await runTest(testContext, dispatcher);
  },
  errors: 0,
  dispatches: 0,
  handlings: 0,
  responses: 0,
  fetches: 0,
}
