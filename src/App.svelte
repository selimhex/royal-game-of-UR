<script>
  import Board from "./Board.svelte";
  import { gameState, pawns, board, game } from "./stores.js";

      //console.clear();
  //$: console.log("gamestate:",$gameState);
  //$: console.log("pawns:",$pawns);
      //$: console.log("board:",$board);
  //$: console.log("game",$game);

</script>
<!--{@debug}-->
<main>
  <Board />
  
</main>
