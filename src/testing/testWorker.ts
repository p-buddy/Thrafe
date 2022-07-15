import { Handler } from '../development/Handler';
import { Dispatcher } from '../development/Dispatcher';
import { mockWorkerContext } from "./mockWorkerContext";
import { handleAndExpectInContext, processResponseAndExpectInContext, respondFromContext, TTestContext, waitForCondition } from './testingUtility';
import { ThreadAPI } from '../development/types';
import { attachHandler, getDispatcher, setTestOverride } from '../development/workerFunctions';

export const testNumber = Math.random() * 1000;
export const testString = `${testNumber}`;
export const testObject = { testNumber, testString };

export type ThreadName = "testWorkerThread";

export type API = ThreadAPI<ThreadName, typeof dispatcher, typeof handler>;

let dispatcher: Dispatcher<{ sendNumberOutAndGetBack: (a: number) => number; }>; 
let handler: Handler<{ 
  passNumberToThread: (p: number) => void; 
  passNumberToThreadAndGetItBack: (p: number) => number; 
  passStringToThread: (s: string) => void; 
  passStringToThreadAndGetItBack: (s: string) => string; 
  passObjectToThread: (o: { testNumber: number; testString: string; }) => void; 
  passObjectToThreadAndGetItBack: (o: { testNumber: number; testString: string; }) => { testNumber: number; testString: string; }; 
}>;

export const testContext: TTestContext = {
  init: () => {
    setTestOverride();
    dispatcher = getDispatcher<{
      sendNumberOutAndGetBack: (a: number) => number;
    }>(mockWorkerContext.scope);

    handler = attachHandler({
      passNumberToThread: (p: number) => {
        handleAndExpectInContext(testContext, testNumber, p);
      },
      passNumberToThreadAndGetItBack: (p: number) => respondFromContext(testContext, p),
      passStringToThread: (s: string) => {
        handleAndExpectInContext(testContext, testString, s);
      },
      passStringToThreadAndGetItBack: (s: string) => respondFromContext(testContext, s),
      passObjectToThread: (o: typeof testObject) => {
        handleAndExpectInContext(testContext, testObject, o);
      },
      passObjectToThreadAndGetItBack: (o: typeof testObject) => respondFromContext(testContext, o)
    }, mockWorkerContext.scope);
  },
  test: async () => {
    let _a = false;
    dispatcher.request("sendNumberOutAndGetBack", 5, (r) => {
      processResponseAndExpectInContext(testContext, 5, r);
      _a = true;
    });
    await waitForCondition(() => _a);
    const r = await dispatcher.resolve("sendNumberOutAndGetBack", 10);
    processResponseAndExpectInContext(testContext, 10, r);
  },
  errors: 0,
  handlings: 0,
  responses: 0,
  dispatches: 0,
  fetches: 0,
}