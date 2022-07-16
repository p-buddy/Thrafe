import { Handler } from '../development/Handler';
import { Dispatcher } from '../development/Dispatcher';
import { mockWorkerContext } from "./mockWorkerContext";
import { runTest, setUp, TestContext, TestMethods } from './testingUtility';
import { ThreadAPI } from '../development/types';
import { setTestOverride } from '../development/workerFunctions';

export const testNumber = Math.random() * 1000;
export const testString = `${testNumber}`;
export const testObject = { testNumber, testString };

export type ThreadName = "testWorkerThread";

export type API = ThreadAPI<ThreadName, typeof dispatcher, typeof handler>;

let dispatcher: Dispatcher<TestMethods>; 
let handler: Handler<TestMethods>;

export const testContext: TestContext = {
  init: () => {
    setTestOverride();
    [dispatcher, handler] = setUp(testContext, mockWorkerContext.scope)
  },
  test: async () => {
    await runTest(testContext, dispatcher);
  },
  errors: 0,
  handlings: 0,
  responses: 0,
  dispatches: 0,
  fetches: 0,
}