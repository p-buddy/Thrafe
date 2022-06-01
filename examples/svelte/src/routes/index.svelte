<script lang="ts">
  import { onMount } from "svelte";
  import { longFunction } from "$lib/utils";

  import { Handler, Thread } from "thrafe";
  import {
    EWorkerToMain,
    EMainToWorker,
    ToThreadAPI,
    FromThreadAPI,
  } from "$lib/workerUnderTest";
  import type { Dispatcher } from "../../../../dist/development/Dispatcher";

  let thread: Thread<ToThreadAPI>;
  let dispatcher: Dispatcher<ToThreadAPI>;
  let handler: Handler<FromThreadAPI>;

  onMount(() => {
    [thread, dispatcher, handler] = Thread.Make<ToThreadAPI, FromThreadAPI>(
      "testWorker",
      {
        [EWorkerToMain.dummy]: (p: number) => {
          dispatcher.send(EMainToWorker.SayHi);
          console.log(p);
        },
        [EWorkerToMain.responseful]: (p: number) => {
          return 0;
        },
      }
    );
  });

  onMount(async () => {
    const thread = new Thread<ToThreadAPI>("testWorker");
    const dispatcher = thread.getDispatcher<EMainToWorker>();
    const handler: Handler<FromThreadAPI> = thread.attachHandler({
      [EWorkerToMain.dummy]: (p: number) => {
        console.log(p);
      },
      [EWorkerToMain.responseful]: (p: number) => {
        return 0;
      },
    });

    const cases = 100;
    const groupSize = cases / 2;
    const bases = Array.from(Array(cases).keys()).map((i) => i);
    const squares = bases.map((n) => n * n);
    const promises = bases.map((n) =>
      dispatcher.resolve(EMainToWorker.GetSquare, n)
    );

    const group1 = promises.slice(0, groupSize);
    const results1 = await Promise.all(group1);

    for (let index = 0; index < results1.length; index++) {
      console.assert(
        results1[index] === squares[index],
        `Results did not match for index ${index}: ${group1[index]} !== ${squares[index]}`
      );
    }
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
