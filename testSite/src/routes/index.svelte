<script lang="ts">
  import { EMainToWorker } from "$lib/mainToWorker";
  import type { MainToWorker } from "$lib/mainToWorker";
  import { onMount } from "svelte";
  import Thread from "$lib/thrafe/Thread";
  import type { Structure } from "$lib/workerUnderTest";

  onMount(() => {
    const thread = new Thread<Structure>("workerUnderTest");
    thread.dispatch(EMainToWorker.GetSquare, 4, (result) => {
      console.log(result);
    });
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
