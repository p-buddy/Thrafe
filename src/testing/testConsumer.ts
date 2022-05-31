import { Dispatcher } from "../development/Dispatcher";
import { Handler } from "../development/Handler";
import { Thread } from "../development/Thread";
import { MainThreadAPI } from "../development/types";
import { mockWorkerContext } from "./mockWorkerContext";
import { dispatched, processResponseAndExpectInContext, respondFromContext, TTestContext } from "./testingUtility";
import { type Api as ThreadAPI, ToThreadEvents, testNumber } from "./testWorker";

export type API = MainThreadAPI<FromThreadEvents, typeof handler>

export const enum FromThreadEvents {
  sendNumberOutAndGetBack
}

let dispatcher: Dispatcher<ThreadAPI>;
let handler: Handler<{ 0: (a: number) => number; }>;

export const testContext: TTestContext = {
  init: () => {
    const thread = new Thread<ThreadAPI>("testWorkerThread", mockWorkerContext.worker);
    dispatcher = thread.getDispatcher<ToThreadEvents>();
    handler = thread.attachHandler({
      [FromThreadEvents.sendNumberOutAndGetBack]: (a: number) => {
        return respondFromContext(testContext, a);
      },
    });
  },
  test: async () => {
    dispatcher.send(ToThreadEvents.passNumberToThread, testNumber);
    dispatched(testContext);
    let random = Math.random();
    await dispatcher.request(ToThreadEvents.passNumberToThreadAndGetItBack, random, (r) => {
      processResponseAndExpectInContext(testContext, random, r);
    });
  },
  errors: 0,
  dispatches: 0,
  handlings: 0,
  responses: 0,
  fetches: 0,
}
