import { Dispatcher } from "../development/Dispatcher";
import { Handler } from "../development/Handler";
import { Thread } from "../development/Thread";
import { mockWorkerContext } from "./mockWorkerContext";
import { dispatched, processResponseAndExpectInContext, respondFromContext, TTestContext } from "./testingUtility";
import { type API, testNumber } from "./testWorker";

export const enum FromThreadEvents {
  sendNumberOutAndGetBack
}

let dispatcher: Dispatcher<API['toThread']>;
let handler: Handler<API['fromThread']>;

export const testContext: TTestContext = {
  init: () => {
    const thread = new Thread<API>("testWorkerThread", mockWorkerContext.worker);
    dispatcher = thread.getDispatcher();
    handler = thread.attachHandler({
      sendNumberOutAndGetBack: (a: number) => {
        return respondFromContext(testContext, a);
      },
    });
  },
  test: async () => {
    dispatcher.send("passNumberToThread", testNumber);
    dispatched(testContext);
    let random = Math.random();
    await dispatcher.request("passNumberToThreadAndGetItBack", random, (r) => {
      processResponseAndExpectInContext(testContext, random, r);
    });
  },
  errors: 0,
  dispatches: 0,
  handlings: 0,
  responses: 0,
  fetches: 0,
}
