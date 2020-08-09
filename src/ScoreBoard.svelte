<script>
  import { gameState, board, pawns } from "./stores.js";
  export let col;
  let owner, ownerID, points;
  ownerID = col === 0 ? 0 : 1;
  owner = ownerID +1;
  let filtArr;
  $: {
  filtArr = $pawns[ownerID].filter((e)=>(e.loc === 15));
  points = filtArr.length;
  }
</script>

<div class="scoreboard" data-owner="{owner}">{points}</div>
