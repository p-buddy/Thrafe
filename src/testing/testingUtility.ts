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