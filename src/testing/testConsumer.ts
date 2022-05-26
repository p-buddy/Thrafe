import { Thread } from "../development/Thread";
import { mockWorkerContext } from "./mockWorkerContext";
import { TTestContext } from "./testingUtility";
import { FromThreadEvents, Structure, testNumber, ToThreadEvents } from "./testWorker";

let thread: Thread<Structure>;
export const testContext: TTestContext = {
  init: () => {
    thread = Thread.Test<Structure>(
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
    testContext.dispatches++;
    await thread.dispatch(ToThreadEvents.passNumberToThreadAndGetItBack, 4, (r) => {
      //console.log(r);
    });
    testContext.dispatches++;
    testContext.fetches++;

  },
  errors: 0,
  dispatches: 0,
  handlings: 0,
  responses: 0,
  fetches: 0,
}
