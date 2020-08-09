<script>
  import { gameState } from './stores.js';
  import Dices from "./Dices.svelte";
  import { random } from './lib/random.js'
  let rnd = new random();

  let newBool = rnd.bool();
  let rollAdice = ()=>{return rnd.int(0, 1);};
  export let rollAll = function(){
    return [(rollAdice()),rollAdice(),rollAdice(),rollAdice()];
  }
  
  const sum = (accumulator, currentValue) => accumulator + currentValue;
  
  let diceToMove;
  
  let rolled = 0;

  let played = 0;
  let status = "";
  let currentPlayer;
  let dicesArr = [0,0,0,0];
  $: diceToMove = dicesArr.reduce(sum);
  $: currentPlayer = $gameState.turn + 1;
  $: $gameState.diceToMove = diceToMove;
  $gameState.rolled = rolled;  
  $gameState.played = played;  
  
  let canitRoll =function(){
    return ($gameState.rolled==0 && $gameState.played==0);
  }
  let roll = function (){
      console.log($gameState.rolled,$gameState.played, canitRoll());
    if (canitRoll()){
        //roll
        dicesArr = rollAll();
        { diceToMove = dicesArr.reduce(sum);
        $gameState.diceToMove=diceToMove;}
        $gameState.rolled = 1;
        //$gameState.turn = ($gameState.turn+1) %2;
        status = `\nPlayer <em>${currentPlayer}</em> just rolled: <em>${diceToMove}`;
    } else {
      status = `\nPlayer ${currentPlayer} can not roll.`;
    }



    //console.log("sasdfsad");
  }
</script>
<div class="status">
<pre>
it's Player <em>{currentPlayer}</em>'s turn
$gameState.turn: <em>{$gameState.turn}</em>
dices rolled: <em>{$gameState.rolled}</em> & player played: <em>{$gameState.played}</em>
{@html status}

</pre>
</div>
<div class="dices">
  <Dices dicesArr={dicesArr} />

</div>
<div class="command">
  <button on:click="{roll}">ROLL</button>

</div>
