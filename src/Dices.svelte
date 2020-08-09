<script>
 export let dicesArr = [0,0,0,0];
</script>

<div>
{#each dicesArr as dice}
  <span>{dice}</span>
{/each}
</div>