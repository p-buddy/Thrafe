<script lang="ts">
  import { EMainToWorker } from "$lib/mainToWorker";
  import type { MainToWorker } from "$lib/mainToWorker";
  import { onMount } from "svelte";
  import Thread from "$lib/thrafe/Thread";
  import type { Structure } from "$lib/workerUnderTest";
  import { EWorkerToMain } from "$lib/workerToMain";
  import { longFunction } from "$lib/utils";

  onMount(async () => {
    const thread = new Thread<Structure>("workerUnderTest", {
      [EWorkerToMain.dummy]: (p) => {
        console.log(p);
      },
      [EWorkerToMain.responseful]: (p) => {
        return 0;
      },
    });

    const cases = 10;
    const bases = Array.from(Array(cases).keys()).map((i) => i);
    const squares = bases.map((n) => n * n);
    const results = await Promise.all(
      bases.map((n) => thread.resolve(EMainToWorker.GetSquare, n))
    );

    for (let index = 0; index < results.length; index++) {
      console.assert(
        results[index] === squares[index],
        `Results did not match for index ${index}: ${results[index]} !== ${squares[index]}`
      );
    }
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
