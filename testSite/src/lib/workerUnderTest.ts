import { EMainToWorker } from "./mainToWorker";
import type { MainToWorker } from "./mainToWorker";
import { handle } from "./thrafe/messageHandling";

handle<MainToWorker, EMainToWorker.GetSquare>(self, EMainToWorker.GetSquare, (value: number) => {
  return value * value;
});

handle<MainToWorker, EMainToWorker.SayHi>(self, EMainToWorker.SayHi, (name: string) => {
  console.log(name);
});