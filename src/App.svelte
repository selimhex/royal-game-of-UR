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

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 50vw;
    margin: 0 auto;
  }

  /*h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}*/

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>

  <p />
  <Board />
  <Dice />
</main>
