<script>
  import {gameState, game, pawns } from "./stores.js";
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
      status: $gameState.status + "\n...next turn...",
      dicesArr: [0,0,0,0]
    };
    console.log("NEXT TURN");
  };

  let restart = function(){
  $pawns = [
    [
      { loc: 0, p: 1, id: 1 },
      { loc: 0, p: 1, id: 2 },
      { loc: 0, p: 1, id: 3 },
      { loc: 0, p: 1, id: 4 },
      { loc: 0, p: 1, id: 5 },
      { loc: 0, p: 1, id: 6 },
      { loc: 0, p: 1, id: 7 }
    ],
    [
      { loc: 0, p: 2, id: 1 },
      { loc: 0, p: 2, id: 2 },
      { loc: 0, p: 2, id: 3 },
      { loc: 0, p: 2, id: 4 },
      { loc: 0, p: 2, id: 5 },
      { loc: 0, p: 2, id: 6 },
      { loc: 0, p: 2, id: 7 }
    ]
  ];
  $gameState =   {
    round: 1,
    turn: ($game.won)%2,
    status: "",
    dicesArr: [0,0,0,0],
    played: 0,
    rolled: 0
  };
  $game =  {
    points: [],
    won: null
  };

}
  const sum = (accumulator, currentValue) => accumulator + currentValue;



  let rolled = 0;

  let played = 0;
  let currentPlayer;
  $gameState.dicesArr = [0, 0, 0, 0];
  $gameState.diceToMove = $gameState.dicesArr.reduce(sum);
  $: currentPlayer = $gameState.turn + 1;
  $gameState.rolled = rolled;
  $gameState.played = played;
  
 
  let canitRoll = function () {
    return $gameState.rolled == 0 && $gameState.played == 0;
  };
  let roll = function () {
    console.log($gameState.rolled, $gameState.played, canitRoll());
    if (canitRoll()) {
      //roll
      $gameState.dicesArr = rollAll();

        $gameState.diceToMove = $gameState.dicesArr.reduce(sum);

      $gameState.rolled = 1;
      //$gameState.turn = ($gameState.turn+1) %2;
      $gameState.status = `\nPlayer <em>${currentPlayer}</em> just rolled: <em>${$gameState.diceToMove}</em>`;
      if ($gameState.diceToMove === 0) {
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
it's <em data-player="{currentPlayer}">Player {currentPlayer}</em>'s turn<!--$gameState.turn: <em>{$gameState.turn}</em>-->
<!--dices rolled: <em>{String(!!($gameState.rolled))}</em> & player played: <em>{String(!!($gameState.played))}</em>-->
{@html ((!!($gameState.rolled))) ? `<em data-player="${currentPlayer}">Player ${currentPlayer}</em> rolled the Dices` : `<em data-player="${currentPlayer}">Player ${currentPlayer}</em> hasn't rolled yet.`}
<!--{@html ((!($gameState.played) && !!($gameState.rolled))) ? `Waiting for <em>Player ${currentPlayer}</em> to play` : ``}-->
{@html $gameState.status}

  </pre>
</div>
<div class="dices">
  {#if ($gameState.rolled)}
  <Dices dicesArr="{$gameState.dicesArr}" />
  {/if}
  {#if (!Boolean($gameState.played) && Boolean($gameState.rolled))}<pre>it's a <em>{$gameState.diceToMove}</em>!</pre>{/if}
</div>
<div class="command">
  {#if $game.won}
  <button on:click={restart}>RESTART</button>
  {:else}
  <button on:click={roll}>ROLL</button>
  <button on:click={nextTurn}>PASS</button>
  {/if}

</div>
