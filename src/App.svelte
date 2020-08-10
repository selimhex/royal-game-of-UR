<script>
  import Board from "./Board.svelte";
  import Dice from "./Dice.svelte";
  import { gameState, pawns, board, game } from "./stores.js";

  //console.clear();
  $: console.log("gamestate:",$gameState);
  $: console.log("pawns:",$pawns);
  //$: console.log("board:",$board);
  $: console.log("game",$game);

  // ??? board
</script>

<main>
  <Board />
  <Dice />
</main>
