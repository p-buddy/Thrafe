import * as chai from 'chai';
import { isDeepStrictEqual } from 'util';

import { initHandlers } from "../development/messageHandling";
import { Payload, Response } from "../development/messageStructure";
import { DefineThread, DefineOneWayMessageStructure } from "../index";
import { mockWorkerContext } from "./mockWorkerContext";

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

let errors = 0;
let equals = <T>(expected: T, actual: T): number => {
  if (isDeepStrictEqual(expected, actual)) return 0;
  errors++;
  console.error(`expected (${expected}) not equal to actual (${actual})`);
  return 1;
}

export const init = () => {
  initHandlers<Structure>(mockWorkerContext.context, {
    [ToThreadEvents.passNumberToThread]: (p) => {
      console.log('hi');
      errors += equals(testNumber, p);
    },
    [ToThreadEvents.passNumberToThreadAndGetItBack]: (p) => p,
    [ToThreadEvents.passStringToThread]: (s) => {
      chai.expect(s).to.equal(testString)
    },
    [ToThreadEvents.passStringToThreadAndGetItBack]: (s) => s,
    [ToThreadEvents.passObjectToThread]: (o) => {
      chai.expect(o).to.eql(testObject)
    },
    [ToThreadEvents.passObjectToThreadAndGetItBack]: (o) => o
  });
}

export const test = () => {

}

export const check = () => errors === 0;
