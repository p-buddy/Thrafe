import { Context } from '../development/Context';
import { mockWorkerContext } from "./mockWorkerContext";
import { Architecture, FromThreadEvents, testNumber, testObject, testString, ToThreadEvents } from './testingArchitecture';
import { handleAndExpectInContext, processResponseAndExpectInContext, respondFromContext, TTestContext, waitForCondition } from './testingUtility';

let context: Context<Architecture>;
export const testContext: TTestContext = {
  init: () => {
    context = new Context(mockWorkerContext.scope, {
      [ToThreadEvents.passNumberToThread]: (p) => {
        handleAndExpectInContext(testContext, testNumber, p);
      },
      [ToThreadEvents.passNumberToThreadAndGetItBack]: (p) => respondFromContext(testContext, p),
      [ToThreadEvents.passStringToThread]: (s) => {
        handleAndExpectInContext(testContext, testString, s);
      },
      [ToThreadEvents.passStringToThreadAndGetItBack]: (s) => respondFromContext(testContext, s),
      [ToThreadEvents.passObjectToThread]: (o) => {
        handleAndExpectInContext(testContext, testObject, o);
      },
      [ToThreadEvents.passObjectToThreadAndGetItBack]: (o) => respondFromContext(testContext, o)
    });
  },
  test: async () => {
    let _a = false;
    context.dispatch(FromThreadEvents.sendNumberOutAndGetBack, 5, (r) => {
      processResponseAndExpectInContext(testContext, 5, r);
      _a = true;
    });
    await waitForCondition(() => _a);
    const r = await context.resolve(FromThreadEvents.sendNumberOutAndGetBack, 10);
    processResponseAndExpectInContext(testContext, 10, r);
  },
  errors: 0,
  handlings: 0,
  responses: 0,
  dispatches: 0,
  fetches: 0,
}