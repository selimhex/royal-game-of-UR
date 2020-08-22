<script>
  import { game, gameState, board, pawns } from "./stores.js";
  export let col;
  let owner, ownerID, points;
  ownerID = col === 1 ? 0 : 1;
  owner = ownerID +1;
  let filtArr;
  $: {
  filtArr = $pawns[ownerID].filter((e)=>(e.loc === 15));
  points = filtArr.length;
  $game.points[ownerID] = points;
  }

  $: console.log ("justScored",$gameState.justScored);
  $: {if ($game.points[ownerID] === 7) {
      $game.won = owner;
      $gameState.status = `<em class="special">Player ${owner} Won!</em>`;
  }}
</script>

<div class="scoreboard" class:won={!!($game.won)} data-owner="{owner}" class:glowOnce={$gameState.justScored && !$game.won}>{points}</div>
