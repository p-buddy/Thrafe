<script lang="ts">
  import { onMount } from "svelte";
  import { longFunction } from "$lib/utils";
  import { type Handler, type Dispatcher, Thread, type To, type From } from "thrafe";
  import type { API } from "$lib/workerUnderTest";

  let thread: Thread<API>;
  let dispatcher: To<typeof thread>;
  let handler: From<typeof thread>;

  onMount(() => {
    [thread, dispatcher, handler] = Thread.Make<API>(
      "testWorker",
      {
        dummy: (p: number) => {
          dispatcher.send("log");
          console.log(p);
        },
        responseful: (p: number) => {
          return 0;
        },
      }
    );
  });

  onMount(async () => {
    const thread: Thread<API> = new Thread<API>("testWorker");
    const dispatcher = thread.getDispatcher();
    const handler = thread.attachHandler({
      dummy: (p: number) => {
        dispatcher.send("log");
        console.log(p);
      },
      responseful: (p: number) => {
        return p;
      },
    });

    const cases = 100;
    const groupSize = cases / 2;
    const bases = Array.from(Array(cases).keys()).map((i) => i);
    const squares = bases.map((n) => n * n);
    const promises = bases.map((n) =>
      dispatcher.resolve("square", n)
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
