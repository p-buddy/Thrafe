import * as path from "path";
import * as chai from 'chai';
import { isDeepStrictEqual } from "util";

export const nameOfFile = (_filename: string) => path.parse(_filename).base.replace(".test", "");
export const nameOfFunc = (func: Function) => `${func.name}()`;

export type TTestContext = {
  init: () => void,
  test: () => void | Promise<void>,
  errors: number,
  dispatches: number,
  fetches: number,
  handlings: number,
  responses: number
}

export const dispatched = (context: TTestContext) => context.dispatches++;
export const fetched = (context: TTestContext) => {
  context.dispatches++;
  context.fetches++;
};


export const respondFromContext = <T>(context: TTestContext, item: T) => {
  context.handlings++;
  context.responses++;
  return item;
}

export const handleAndExpectInContext = <T>(context: TTestContext, expected: T, actual: T): number => {
  context.handlings++;
  if (isDeepStrictEqual(expected, actual)) return;
  context.errors++;
  console.error(`Handle Error: expected (${expected}) not equal to actual (${actual})`);
  return;
}

export const processResponseAndExpectInContext = <T>(context: TTestContext, expected: T, actual: T): number => {
  context.dispatches++;
  context.fetches++;
  if (isDeepStrictEqual(expected, actual)) return;
  context.errors++;
  console.error(`Fetch Error: expected (${expected}) not equal to actual (${actual})`);
  return;
}

export const compareContexts = (a: TTestContext, b: TTestContext) => {
  chai.expect(a.dispatches).to.equal(b.handlings);
  chai.expect(b.dispatches).to.equal(a.handlings);
  chai.expect(a.fetches).to.equal(b.responses);
  chai.expect(b.fetches).to.equal(a.responses);
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