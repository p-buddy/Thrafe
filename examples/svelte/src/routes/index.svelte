<script lang="ts">
  import { onMount } from "svelte";
  import { EWorkerToMain } from "$lib/workerToMain";
  import { longFunction } from "$lib/utils";

  import { Thread } from "thrafe";
  import type { API } from "$lib/workerUnderTest";
  import { setHandler } from "$lib/workerToMain";

  onMount(async () => {
    const thread = new Thread<API>("testWorker");
    const handler = thread.attachHandler({
      [EWorkerToMain.dummy]: (p) => {
        console.log(p);
      },
      [EWorkerToMain.responseful]: (p) => {
        return 0;
      },
    });

    // [EWorkerToMain.dummy]: (p) => {
    //   console.log(p);
    // },
    // [EWorkerToMain.responseful]: (p) => {
    //   return 0;
    // },

    // const cases = 100;
    // const groupSize = cases / 2;
    // const bases = Array.from(Array(cases).keys()).map((i) => i);
    // const squares = bases.map((n) => n * n);
    // const promises = bases.map((n) =>
    //   thread.resolve(EMainToWorker.GetSquare, n)
    // );

    // const group1 = promises.slice(0, groupSize);
    // const results1 = await Promise.all(group1);

    // for (let index = 0; index < results1.length; index++) {
    //   console.assert(
    //     results1[index] === squares[index],
    //     `Results did not match for index ${index}: ${group1[index]} !== ${squares[index]}`
    //   );
    // }
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
