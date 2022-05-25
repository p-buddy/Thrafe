<script lang="ts">
  import { EMainToWorker } from "$lib/mainToWorker";
  import type { MainToWorker } from "$lib/mainToWorker";
  import { onMount } from "svelte";
  import Thread from "$lib/thrafe/development/Thread";
  import type { Structure } from "$lib/workerUnderTest";
  import { EWorkerToMain } from "$lib/workerToMain";
  import { longFunction } from "$lib/utils";

  onMount(async () => {
    const thread = new Thread<Structure>("testWorker", {
      [EWorkerToMain.dummy]: (p) => {
        console.log(p);
      },
      [EWorkerToMain.responseful]: (p) => {
        return 0;
      },
    });

    const cases = 100;
    const groupSize = cases / 2;
    const bases = Array.from(Array(cases).keys()).map((i) => i);
    const squares = bases.map((n) => n * n);
    const promises = bases.map((n) =>
      thread.resolve(EMainToWorker.GetSquare, n)
    );

    const group1 = promises.slice(0, groupSize);
    const results1 = await Promise.all(group1);

    for (let index = 0; index < results1.length; index++) {
      console.assert(
        results1[index] === squares[index],
        `Results did not match for index ${index}: ${group1[index]} !== ${squares[index]}`
      );
    }

    // dispatch another round

    // await for second & third group to end
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
