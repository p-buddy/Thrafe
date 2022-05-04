<script lang="ts">
  import { EMainToWorker } from "$lib/mainToWorker";
  import type { MainToWorker } from "$lib/mainToWorker";
  import { onMount } from "svelte";
  import Thread from "$lib/thrafe/Thread";
  import type { Structure } from "$lib/workerUnderTest";
  import { EWorkerToMain } from "$lib/workerToMain";
  import { longFunction } from "$lib/utils";

  onMount(() => {
    const thread = new Thread<Structure>("workerUnderTest", {
      [EWorkerToMain.dummy]: (p) => {
        console.log(p);
      },
      [EWorkerToMain.responseful]: (p) => {
        return 0;
      },
    });

    // const x = await thread.resolve(EMainToWorker.GetSquare, 16);

    thread.dispatch(EMainToWorker.GetSquare, 16, (r: number) => {
      thread.handle<EWorkerToMain.dummy>(EWorkerToMain.dummy, () => {
        console.log("dummy!");
      });
      thread.dispatch<EMainToWorker.SayHi>(EMainToWorker.SayHi, "goober");
    });
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
