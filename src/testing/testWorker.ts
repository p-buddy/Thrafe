import { Handler } from '../development/Handler';
import { Dispatcher } from '../development/Dispatcher';
import { mockWorkerContext } from "./mockWorkerContext";
import { handleAndExpectInContext, processResponseAndExpectInContext, respondFromContext, TTestContext, waitForCondition } from './testingUtility';
import { WorkerThreadAPI } from '../development/types';
import { attachHandler, getDispatcher } from '../development/workerFunctions';
import { API as MainAPI, FromThreadEvents } from './testConsumer';

export const testNumber = Math.random() * 1000;
export const testString = `${testNumber}`;
export const testObject = { testNumber, testString };

export type ThreadName = "testWorkerThread";

export type Api = WorkerThreadAPI<
  ThreadName,
  ToThreadEvents,
  typeof handler>;

export const enum ToThreadEvents {
  passNumberToThread,
  passNumberToThreadAndGetItBack,
  passStringToThread,
  passStringToThreadAndGetItBack,
  passObjectToThread,
  passObjectToThreadAndGetItBack,
}

let dispatcher: Dispatcher<MainAPI>;
let handler: Handler<{ 0: (p: number) => void; 1: (p: number) => number; 2: (s: string) => void; 3: (s: string) => string; 4: (o: { testNumber: number; testString: string; }) => void; 5: (o: { testNumber: number; testString: string; }) => { testNumber: number; testString: string; }; }>;

export const testContext: TTestContext = {
  init: () => {
    dispatcher = getDispatcher<Api, ToThreadEvents>(mockWorkerContext.scope);
    handler = attachHandler({
      [ToThreadEvents.passNumberToThread]: (p: number) => {
        handleAndExpectInContext(testContext, testNumber, p);
      },
      [ToThreadEvents.passNumberToThreadAndGetItBack]: (p: number) => respondFromContext(testContext, p),
      [ToThreadEvents.passStringToThread]: (s: string) => {
        handleAndExpectInContext(testContext, testString, s);
      },
      [ToThreadEvents.passStringToThreadAndGetItBack]: (s: string) => respondFromContext(testContext, s),
      [ToThreadEvents.passObjectToThread]: (o: typeof testObject) => {
        handleAndExpectInContext(testContext, testObject, o);
      },
      [ToThreadEvents.passObjectToThreadAndGetItBack]: (o: typeof testObject) => respondFromContext(testContext, o)
    }, mockWorkerContext.scope);
  },
  test: async () => {
    let _a = false;

    dispatcher.request(FromThreadEvents.sendNumberOutAndGetBack, 5, (r) => {
      processResponseAndExpectInContext(testContext, 5, r);
      _a = true;
    });
    await waitForCondition(() => _a);
    const r = await dispatcher.resolve(FromThreadEvents.sendNumberOutAndGetBack, 10);
    processResponseAndExpectInContext(testContext, 10, r);
  },
  errors: 0,
  handlings: 0,
  responses: 0,
  dispatches: 0,
  fetches: 0,
}