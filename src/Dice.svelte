<script>
  import { gameState, game, pawns } from "./stores.js";
  import Dices from "./Dices.svelte";
  import { random } from "./lib/random.js";
  //import { nextTurn } from "./logic.svelte";
  //import gamelogic from "./gamelogic.js";
  let rnd = new random();

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
      dicesArr: [0, 0, 0, 0],
      //settings: $gameState.settings,
      justScored: false
    };
    console.log("NEXT TURN");
  };

  let restart = function () {
    $pawns = [
      [
        { loc: 0, p: 1, id: 1 },
        { loc: 0, p: 1, id: 2 },
        { loc: 0, p: 1, id: 3 },
        { loc: 0, p: 1, id: 4 },
        { loc: 0, p: 1, id: 5 },
        { loc: 0, p: 1, id: 6 },
        { loc: 0, p: 1, id: 7 },
      ],
      [
        { loc: 0, p: 2, id: 1 },
        { loc: 0, p: 2, id: 2 },
        { loc: 0, p: 2, id: 3 },
        { loc: 0, p: 2, id: 4 },
        { loc: 0, p: 2, id: 5 },
        { loc: 0, p: 2, id: 6 },
        { loc: 0, p: 2, id: 7 },
      ],
    ];
    $gameState = {
      round: 1,
      turn: $game.won % 2,
      status: "",
      dicesArr: [0, 0, 0, 0],
      played: 0,
      rolled: 0,
      settings: $gameState.settings,
      justScored: false
    };
    $game = {
      points: [],
      won: null,
    };
  };
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
  export function roll () {
    //console.log($gameState.rolled, $gameState.played, canitRoll());
    if (canitRoll()) {
      //roll
      $gameState.dicesArr = rollAll();

      $gameState.diceToMove = $gameState.dicesArr.reduce(sum);

      $gameState.rolled = 1;
      //$gameState.turn = ($gameState.turn+1) %2;
      $gameState.status = `\nPlayer <em>${currentPlayer}</em> just rolled: <em>${$gameState.diceToMove}</em>`;
      if ($gameState.diceToMove === 0) {
        //$gameState.status += "rolled a 0...";
        setTimeout(() => {
        nextTurn();
        }, 1000)
      }
    } else {
      $gameState.status += `\nDice is already rolled, you can not roll again.`;
    }

    //console.log("sasdfsad");
  };
</script>


  <div class="command fullscreen" class:visible={$game.won}>
    <p data-owner={$game.won}>Player {$game.won} won!</p>
    <button on:click={restart}>RESTART</button>
    <p></p>
  </div>

