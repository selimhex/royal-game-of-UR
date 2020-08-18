<script>
  import DiceSVG from "./DiceSVG.svelte";

  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });

  export let dicesArr = [0, 0, 0, 0];
  export let rolled = 0;
  //export let turn = null;
  export let pos = { left: 0, top: 0, width: 0, height: 0 };
  export let moveToDeck;
  let style = "";
  $: style = (moveToDeck) ? `position: absolute; top: ${pos.top}px; left: ${pos.left}px; width: ${pos.width}px; height: ${pos.height}px;` : "";
</script>

  <div class="dicesBlock" class:rolled {style} on:click>
    {#each dicesArr as dice, i}
      <!--div class="die" class:rolled in:receive={{ key: i }}
  out:send={{ key: i }}-->
      <DiceSVG rolledNum={dice}/>
      <!--/div-->
    {/each}
  </div>