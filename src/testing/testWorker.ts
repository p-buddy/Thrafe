import { Context } from '../development/Context';
import { Payload, Response } from "../development/types/messageStructure";
import { DefineThread, DefineOneWayMessageStructure } from "../index";
import { mockWorkerContext } from "./mockWorkerContext";
import { handleAndExpectInContext, processResponseAndExpectInContext, respondFromContext, TTestContext } from './testingUtility';

export const testNumber = Math.random() * 1000;
export const testString = `${testNumber}`;

export const testObject = { testNumber, testString };

export type ThreadName = "testWorkerThread";

export const enum ToThreadEvents {
  passNumberToThread,
  passNumberToThreadAndGetItBack,
  passStringToThread,
  passStringToThreadAndGetItBack,
  passObjectToThread,
  passObjectToThreadAndGetItBack,
}

export type ToThread = DefineOneWayMessageStructure<ToThreadEvents, {
  [ToThreadEvents.passNumberToThread]: { payload: number },
  [ToThreadEvents.passNumberToThreadAndGetItBack]: { payload: number, response: number },
  [ToThreadEvents.passStringToThread]: { payload: string },
  [ToThreadEvents.passStringToThreadAndGetItBack]: Payload<string> & Response<string>,
  [ToThreadEvents.passObjectToThread]: Payload<typeof testObject>,
  [ToThreadEvents.passObjectToThreadAndGetItBack]: Payload<typeof testObject> & Response<typeof testObject>,
}>;

export const enum FromThreadEvents {
  sendNumberFromThread,
  sendNumberOutAndGetBack
}

export type FromThread = DefineOneWayMessageStructure<FromThreadEvents, {
  [FromThreadEvents.sendNumberFromThread]: { payload: number },
  [FromThreadEvents.sendNumberOutAndGetBack]: { payload: number, response: number },
}>;

export type Structure = DefineThread<ThreadName, ToThread, FromThread>;

let context: Context<Structure>;
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
    context.dispatch(FromThreadEvents.sendNumberOutAndGetBack, 5, (r) => {
      processResponseAndExpectInContext(testContext, 5, r);
    });
    testContext.dispatches++;
    const r = await context.resolve(FromThreadEvents.sendNumberOutAndGetBack, 10);
    testContext.dispatches++;
    processResponseAndExpectInContext(testContext, 10, r);
  },
  errors: 0,
  handlings: 0,
  responses: 0,
  dispatches: 0,
  fetches: 0,
}