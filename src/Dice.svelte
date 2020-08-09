<script>
  import stores, { gameState } from "./stores.js";
  import Dices from "./Dices.svelte";
  import { random } from "./lib/random.js";
  //import { nextTurn } from "./logic.svelte";
  //import gamelogic from "./gamelogic.js";
  let rnd = new random();

  let newBool = rnd.bool();
  let rollAdice = () => {
    return rnd.int(0, 1);
  };
  export let rollAll = function () {
    return [rollAdice(), rollAdice(), rollAdice(), rollAdice()];
  };

  export let nextTurn = function () {
    $gameState = {
      turn: ($gameState.turn + 1) % 2,
      rolled: 0,
      played: 0,
      round: $gameState.round + 1,
      status: $gameState.status + "\n...next turn..."
    };
    console.log("NEXT TURN");
  };
  const sum = (accumulator, currentValue) => accumulator + currentValue;

  let diceToMove;

  let rolled = 0;

  let played = 0;
  let currentPlayer;
  let dicesArr = [0, 0, 0, 0];
  $: diceToMove = dicesArr.reduce(sum);
  $: currentPlayer = $gameState.turn + 1;
  $: $gameState.diceToMove = diceToMove;
  $gameState.rolled = rolled;
  $gameState.played = played;

  let canitRoll = function () {
    return $gameState.rolled == 0 && $gameState.played == 0;
  };
  let roll = function () {
    console.log($gameState.rolled, $gameState.played, canitRoll());
    if (canitRoll()) {
      //roll
      dicesArr = rollAll();
      {
        diceToMove = dicesArr.reduce(sum);
        $gameState.diceToMove = diceToMove;
      }
      $gameState.rolled = 1;
      //$gameState.turn = ($gameState.turn+1) %2;
      $gameState.status = `\nPlayer <em>${currentPlayer}</em> just rolled: <em>${diceToMove}</em>`;
      if (diceToMove === 0) {
        //$gameState.status += "rolled a 0...";
        nextTurn();
      }
    } else {
      $gameState.status += `\nDice is already rolled, you can not roll again.`;
    }

    //console.log("sasdfsad");
  };
</script>

<div class="status">
  <pre>
Round: <em>{$gameState.round}</em>
it's Player <em>{currentPlayer}</em>'s turn<!--$gameState.turn: <em>{$gameState.turn}</em>-->
<!--dices rolled: <em>{String(!!($gameState.rolled))}</em> & player played: <em>{String(!!($gameState.played))}</em>-->
{@html ((!!($gameState.rolled))) ? `<em>Player ${currentPlayer}</em> rolled the Dices` : `<em>Player ${currentPlayer}</em> haven't rolled yet.`}
{@html ((!($gameState.played) && !!($gameState.rolled))) ? `Waiting for <em>Player ${currentPlayer}</em> to play` : ``}

{@html $gameState.status}

  </pre>
</div>
<div class="dices">
  <Dices {dicesArr} />
  <pre>it's a <em>{diceToMove}</em>!</pre>
</div>
<div class="command">
  <button on:click={roll}>ROLL</button>
  <button on:click={nextTurn}>PASS</button>

</div>
