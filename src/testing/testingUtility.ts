import * as path from "path";
import * as chai from 'chai';
import { isDeepStrictEqual } from "util";
import { ThreadAPI } from "../development/types";
import { testNumber, testObject, testString } from "./testWorker";
import { Dispatcher } from "../development/Dispatcher";
import { attachHandler, getDispatcher, setTestOverride } from "../development/workerFunctions";
import Scope from "../development/Scope";
import { Handler } from "../development/Handler";
import { Thread } from "../development/Thread";

export type TestMethods = { 
  passNumberToThread: (p: number) => void; 
  passNumberToThreadAndGetItBack: (p: number) => number; 
  passStringToThread: (s: string) => void; 
  passStringToThreadAndGetItBack: (s: string) => string; 
  passObjectToThread: (o: { testNumber: number; testString: string; }) => void; 
  passObjectToThreadAndGetItBack: (o: { testNumber: number; testString: string; }) => { testNumber: number; testString: string; }; 
};

export type TestContext = {
  init: () => void,
  test: () => void | Promise<void>,
  errors: number,
  dispatches: number,
  fetches: number,
  handlings: number,
  responses: number
}

type API =  ThreadAPI<any, Dispatcher<TestMethods>, Handler<TestMethods>>;

export const nameOfFile = (_filename: string) => path.parse(_filename).base.replace(".test", "");
export const nameOfFunc = (func: Function) => `${func.name}()`;

export const setUp = (testContext: TestContext, scope: Scope, thread?: Thread<API>): [Dispatcher<TestMethods>, Handler<TestMethods>] => {
  setTestOverride();
  const useThread = thread !== undefined;
  const dispatcher = useThread ? thread.getDispatcher() : getDispatcher<TestMethods>(scope);
  const handlers = {
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
  };
  const handler = useThread ? thread.attachHandler(handlers) : attachHandler(handlers, scope);
  return [dispatcher, handler];
}

export const runTest = async (testContext: TestContext, dispatcher: Dispatcher<TestMethods>) => {
  const conditions: boolean[] = [false];

  dispatcher.send("passNumberToThread", testNumber);
  dispatched(testContext);

  let random = Math.random();
  dispatcher.request("passNumberToThreadAndGetItBack", random, (response) => {
    processResponseAndExpectInContext(testContext, random, response);
    conditions[0] = true;
  });

  dispatcher.send("passStringToThread", testString);
  dispatched(testContext);

  const resultString = await dispatcher.resolve("passStringToThreadAndGetItBack", testString);
  processResponseAndExpectInContext(testContext, testString, resultString);
  
  dispatcher.send("passObjectToThread", testObject);
  dispatched(testContext);

  conditions.push(false);
  dispatcher.request("passObjectToThreadAndGetItBack", testObject, (response) => {
    processResponseAndExpectInContext(testContext, testObject, response);
    conditions[1] = true;
  });

  await Promise.all(conditions.map((_, index) => waitForCondition(() => conditions[index])));
}

export const dispatched = (context: TestContext) => context.dispatches++;
export const fetched = (context: TestContext) => {
  context.dispatches++;
  context.fetches++;
};


export const respondFromContext = <T>(context: TestContext, item: T) => {
  context.handlings++;
  context.responses++;
  return item;
}

export const handleAndExpectInContext = <T>(context: TestContext, expected: T, actual: T): void => {
  context.handlings++;
  if (isDeepStrictEqual(expected, actual)) return;
  context.errors++;
  console.error(`Handle Error: expected (${expected}) not equal to actual (${actual})`);
  return;
}

export const processResponseAndExpectInContext = <T>(context: TestContext, expected: T, actual: T): void => {
  fetched(context);
  if (isDeepStrictEqual(expected, actual)) return;
  context.errors++;
  console.error(`Fetch Error: expected (${expected}) not equal to actual (${actual})`);
  return;
}

export const compareContexts = (a: TestContext, b: TestContext) => {
  chai.expect(a.dispatches).to.equal(b.handlings, "a.dispatches vs b.handlings");
  chai.expect(b.dispatches).to.equal(a.handlings, "b.dispatches vs a.handlings");
  chai.expect(a.fetches).to.equal(b.responses, "a.fetches vs b.responses");
  chai.expect(b.fetches).to.equal(a.responses, "b.fetches vs a.responses");
}

export async function waitForCondition(condition: () => boolean, delay: number = 100): Promise<void> {
  let timeout: NodeJS.Timeout = setTimeout(() => null, 0);
  while (!condition()) {
    await new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(resolve, delay);
    });
  }
  clearTimeout(timeout);
};