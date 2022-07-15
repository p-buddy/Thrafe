import { attachHandler, getDispatcher, type ThreadAPI } from "thrafe";

export type API = ThreadAPI<"testWorker", typeof dispatcher, typeof handler>;

const dispatcher = getDispatcher<{
  dummy: (p: number) => void,
  responseful: (p: number) => number,
}>();

const handler = attachHandler({
  cube: async (a: number) => {
    await Promise.resolve();
    return a * a * a;
  },
  divide: (a: number, b: number): number => {
    return a / b;
  },
  square: (a: number) => {
    dispatcher.request("responseful", 4);
    return a * a;
  },
  log: () => {
    console.log('hello from a thread!');
  }
});