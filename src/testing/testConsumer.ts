import { Thread } from "../development/Thread";
import { mockWorkerContext } from "./mockWorkerContext";
import { dispatched, processResponseAndExpectInContext, TTestContext } from "./testingUtility";
import { FromThreadEvents, Architecture, testNumber, ToThreadEvents } from "./testingArchitecture";

let thread: Thread<Architecture>;
export const testContext: TTestContext = {
  init: () => {
    thread = Thread.Test<Architecture>(
      "testWorkerThread",
      {
        [FromThreadEvents.sendNumberFromThread]: (p) => { testContext.handlings++ },
        [FromThreadEvents.sendNumberOutAndGetBack]: (p) => {
          testContext.handlings++;
          testContext.responses++;
          return p;
        },
      },
      mockWorkerContext.worker
    );
  },
  test: async () => {
    thread.dispatch(ToThreadEvents.passNumberToThread, testNumber);
    dispatched(testContext);
    let random = Math.random();
    await thread.dispatch(ToThreadEvents.passNumberToThreadAndGetItBack, random, (r) => {
      processResponseAndExpectInContext(testContext, random, r);
    });
  },
  errors: 0,
  dispatches: 0,
  handlings: 0,
  responses: 0,
  fetches: 0,
}
