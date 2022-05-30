import type { MainThreadAPI } from "thrafe";

export type API = MainThreadAPI<EWorkerToMain, typeof handler>;

export const enum EWorkerToMain {
  dummy,
  responseful
}

export let handler;