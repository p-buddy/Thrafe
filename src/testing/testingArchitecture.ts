import { Payload, Response } from "../development/types/messageStructure";
import { DefineThreadArchitecture, DefineOneWayMessageStructure } from "../index";

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

export type Architecture = DefineThreadArchitecture<ThreadName, ToThread, FromThread>;