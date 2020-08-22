<script>
  import { gameState, board, pawns, game } from "./stores.js";
  import Pawn from "./Pawn.svelte";
  import ScoreBoard from "./ScoreBoard.svelte";
  import Dice from "./Dice.svelte";
  import Dices from "./Dices.svelte";
  import DiceSVG from "./DiceSVG.svelte";
  let Wiwi;

  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { onMount } from 'svelte';


  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;

      return {
        duration: 600,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
      };
    },
  });

  $: currentPlayer = $gameState.turn + 1;
  let residingPawn;
  const qS = (a) => {
    return document.querySelector(a);
  };
  const qA = (a) => {
    return document.querySelectorAll(a);
  };

  let type = function (c) {
    return c < 5 || 12 < c ? "safe" : "combat";
  };

  let tdclass = function (c) {
    return c === 8 || c === 4 ? "special" : "";
  };

  let mayItPlay = function (owner) {
    return (
      $gameState.rolled == 1 && $gameState.played == 0 && currentPlayer == owner
    );
  };
  let nextTurn = function (doubledice = false) {
    $gameState = {
      turn: ($gameState.turn + (doubledice ? 0 : 1)) % 2,
      rolled: 0,
      played: 0,
      round: $gameState.round + 1,
      status: $gameState.status + "\n...next turn...",
      dicesArr: [0, 0, 0, 0],
      settings: $gameState.settings,
      justScored: $gameState.justScored
    };
    $gameState.turn = $gameState.turn;    
    // console.log("NEXT TURN");
  };
  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  let move = function (owner, id, thisPawn) {
    let ownerID = owner - 1;
    $gameState.justScored = false;
    // console.log(  mayItPlay(owner) ? `${owner} may play` : `${owner} may not play`);
    if (mayItPlay(owner)) {
      let col;
      // ###### FIX findIndex -> find ?!?!?!??! ####
      const index = $pawns[ownerID].findIndex((item) => item.id === Number(id));
      const pawnObj = $pawns[ownerID][index];
      const orderToGo = pawnObj.loc + $gameState.diceToMove;
      // console.log(orderToGo, owner, pawnObj.id, pawnObj.loc);
      let found, foundOwn, foundOpponent;
      let foundBool,
        foundOwnBool,
        foundOpponentBool,
        canMoveBool = true;
      if (type(orderToGo) === "safe") {
        col = Number(owner == 1 ? 1 : 3);
        // console.log("check col", col);
        if (orderToGo === 15) {
          pawnObj.loc = 15;
          $gameState.justScored = true;
          setTimeout(() => {
                $gameState.justScored=false;
              }, 2000)
          $gameState.status = `<em>Player ${owner}'s</em> Pawn <em>${pawnObj.id}</em> made it!.\n1 Point for <em>Player ${owner}!</em>`;
        } else if (orderToGo > 15) {
          canMoveBool = false;
          $gameState.status = `You should land exactly onto the New Home\nIf you can't move otherwise you should <code>Pass</code>`;
        } else if (orderToGo === 0) {
          $gameState.status = `This message shouldn't appear. Case is checked in Dice.svelte`;
        } else {
          found = $pawns[ownerID].find((e) => e.loc === orderToGo);
          foundBool = found !== null && found !== undefined ? true : false;
          if (foundBool) {
            $gameState.status = `<em>Player ${owner}'s </em> own pawn is there. \nIf you can't move otherwise you should <code>Pass</code>`;
          } else {
            // DO A COMMON NOT FOUND ⏬
          }
        }
      } else {
        // !!!!!!!!!!!!!!!!!! ITS COMBAT ZONE!!!!!!!!!!!!!!!!!!
        col = 2;
        foundOpponent = $pawns[(ownerID + 1) % 2].find(
          (e) => e.loc === orderToGo
        );
        foundOpponentBool =
          foundOpponent !== null && foundOpponent !== undefined ? true : false;
        if (foundOpponentBool) {
          $gameState.status = `Opponent <em>Player ${
            ((ownerID + 1) % 2) + 1
          }'s </em> pawn is there.`;
        }
        foundOwn = $pawns[ownerID].find((e) => e.loc === orderToGo);
        foundOwnBool =
          foundOwn !== null && foundOwn !== undefined ? true : false;
        if (foundOwnBool) {
          $gameState.status += `\n<em>Player ${owner}'s </em> own pawn is there.`;
        }
      }

      //console.log("that cell", col, orderToGo);

      // ############## I CAN MOVE FREELY  ##############
      if (!found && !foundOwn && !foundOpponentBool && canMoveBool) {
        //console.log("MOVING PAWN");
        $gameState.status += `\nPlayer <em data-player="${currentPlayer}">${currentPlayer}</em>'s Pawn #<em data-player="${currentPlayer}">${pawnObj.id}</em> moving to square <em>${orderToGo}</em>`;
        if (orderToGo === 8) {
          $gameState.status += `\nPawn is now <em>Untouchable</em>!`;
        }
        if (orderToGo === 8 || orderToGo === 4) {
          $gameState.status += `\n<em data-player="${currentPlayer}">${currentPlayer} gets to play again!</em>`;
        }
        $pawns[ownerID][index].loc = orderToGo;
        $gameState.played = 1;
        nextTurn(orderToGo === 8 || orderToGo === 4 ? true : false);
      } else if (foundOpponentBool) {
        if (orderToGo === 8) {
          $gameState.status += `\nPlayer <em>${foundOpponent.p}</em>'s Pawn #<em>${foundOpponent.id}</em> is Safe!
Try another move!`;
        } else {
          $gameState.status += `Send 'em Home!`;
          $gameState.status += `\nPlayer <em>${foundOpponent.p}</em>'s Pawn #<em>${foundOpponent.id}</em> going back Home `;
          foundOpponent.loc = 0;
          $pawns[ownerID][index].loc = orderToGo;
          $gameState.played = 1;
          nextTurn();
        }
      }
    } else {
      //console.log(mayItPlay(owner)? `${owner} may play` : `${owner} may not play`);
      $gameState.status +=
        owner !== undefined
          ? `\nit's not Player <em>${owner}</em>'s turn!.`
          : `\nno pawns there!`;
      //$gameState.status += `\nit's not your turn!.`;
      //console.log(`it's not your turn!.`);
    }
  };

  let uniq = a => [...new Set(a)];

  let hasMoves = function(player,diceToMove,thispawn=null){
    //console.log("player",player, "dicetomove",diceToMove);
    let newset = $pawns[player].map((t)=>(t.loc + diceToMove)).filter((t)=>t<16);
    let iCanGo2 = uniq(newset);
    //console.log("IcanGo2",iCanGo2);
    let safesIcanGo2 = iCanGo2.filter(t=>(type(t)==="safe"));

    //console.log("safesIcanGo2",safesIcanGo2);
    let ownpawnsOnBoard = uniq([...$pawns[player]].map(t=>t.loc).filter(t=>(0<t)&&(t<15)));
    //console.log("ownpawnsOnBoard", ownpawnsOnBoard);
    let opponentsSafePawn = uniq([...$pawns[(player+1)%2]].map(t=>t.loc).filter(t=>(t===8)));
    //console.log("opponentsSafePawn",opponentsSafePawn);
    let allPawnsInWarZone = uniq([...$pawns[0], ...$pawns[1]].map(t=>t.loc).filter(t=>(4<t)&&(t<13)));
    //console.log("allPawnsInWarZone",allPawnsInWarZone);
    let difference = iCanGo2.filter(x => !ownpawnsOnBoard.includes(x) && !opponentsSafePawn.includes(x));
    //console.log("difference",difference);
    //console.log(difference.length, (difference.length>0)?"has move":"no moves");
    if (thispawn !== null & thispawn !== undefined) {
      console.log ( "difference:", difference );
      console.log ( "thispawn + diceToMove:", `${thispawn} + ${diceToMove} = ${thispawn+diceToMove}` );
      console.log ( "movable pawns:", (difference.filter(x=>x===(thispawn+diceToMove)).length>0)?thispawn:null );
      
      console.log ((difference.filter(x=>x===(thispawn+diceToMove)).length>0)?`${player} ${diceToMove} ${thispawn}`:false);
      return ((difference.filter(x=>x===(thispawn+diceToMove)).length>0)?true:false);
    } else {
      return ((difference.length>0)?true:false);}
    //newset = newset.some((e)=>( $pawns[player].filter((t)=>(t.loc !==e)) ));
    /*console.log("üstüme basma", newset.filter((n)=>
      $pawns[player].filter((t)=>(t.loc !==n)) 
    ));
    console.log(newset);*/
    //filter((t)=>t.loc < 15).map((t)=>(t.loc + diceToMove)) 
    //console.log($pawns[player].filter((t)=>t.loc < 15).map((t)=>(t.loc + diceToMove)).filter((t)=>t.loc < 15));    
    
  }
  function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
  }
  
  let mounted=false;
  onMount(()=>{mounted = true;}
  );
  let activeDeck;
  let deckPos;
  deckPos = {top: null,left:null,width:null, height: null}
  //$: activeDeck = document.querySelector(`.deck${$gameState.turn+1} .tetra-dices`);
  $: (deckPos)? deckPos.left : {} = ( (activeDeck) ? getOffset(activeDeck).left: undefined);
  $: (deckPos)? deckPos.top : {} = ( (activeDeck) ? getOffset(activeDeck).top: undefined);
  //$: console.log("deckPos",deckPos);
  let positionDices = function(e){
    //console.log("left", getOffset(e).left);
    //console.log("top", getOffset(e).top);
  }
  $: if (mounted) {
  }
  
 let sX, sY, iW, iH;
  $: {iW || iH, 
    deckPos.left = ( (activeDeck) ? getOffset(activeDeck).left: {});
    deckPos.top = ( (activeDeck) ? getOffset(activeDeck).top: {});
  }
  
  let t1height, t1width;
  $: {deckPos.width=t1width; deckPos.height=t1height};
  let boardDiv;
  $: {if ($gameState.rolled===1) {
    if (!hasMoves($gameState.turn,$gameState.diceToMove)) {
      setTimeout(() => {
        nextTurn();
    }, 1000)
      
    }
    }}
      
  //$: {console.log(boardDiv.classList)}
</script>

<div class="board" class:fadeAlittle={($gameState.rolled===1)} bind:this={boardDiv}>
  <div class="ghostlayer" class:ghVisible={($gameState.rolled===1)}>
    <Dices dicesArr={$gameState.dicesArr} moveToDeck={false} rolled={$gameState.rolled} />
  </div>
  <!--<div class="deck deck1">
    
    <div class="tetra-dices" class:active={($gameState.turn===0)}>
      
    </div>

  </div>-->
  <table>

    {#each $board[0].col[0] as row, iy}
      <tr>
        {#each $board[0].col as cell, ix}
          {#if cell[iy] == '15'}
            <td class="none">
              <ScoreBoard col={ix} />
            </td>
          {:else if (iy == '0') && cell[iy] == '0'}
          <td class="start none">
            {#if ix === 0 || ix === 4 }
            <div
            class="pawns pawns{(ix===0? 1 : 2)}"
            on:click={(e) => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target)}>
            {#each $pawns[(ix===0?0:1)].filter((t) => t.loc === 0) as pawn, pi (pawn.id)}
              <div
                class="pawn"
                data-owner={pawn.p}
                data-pawnname={pawn.id}
                in:receive={{ key: pawn.key }}
                out:send={{ key: pawn.key }}
                animate:flip
                class:helpglow={(
                  ( (pawn.p===1?0:1) === $gameState.turn && $gameState.settings.helpmode && !!$gameState.rolled && ($gameState.diceToMove!==0) && pi < 1) ? ( hasMoves((pawn.p===1?0:1),$gameState.diceToMove, pawn.loc) ) : false
                )}>
                {pawn.id}
              </div>
            {/each}
      
            </div>
            {/if}
            </td>
          {:else if ((ix == 0 || ix == 4) && (4 === iy))}
           
            {#if ( ( ($gameState.turn===0) && (ix===0)) || ( ($gameState.turn===1) && (ix===4) ) )}
              <td class="none" rowspan="4" bind:this={activeDeck} bind:offsetWidth={t1width}
              bind:offsetHeight={t1height}>
              
              </td>
            {:else}
            <td class="none" rowspan="4"></td>
            {/if}
          
            
          {:else if (ix===0 || ix===4) && (4 < iy)}
          <!-- -->
          {:else if cell[iy] == '0'}
            <td class="none" />
          {:else}
            <td
              data-col={ix}
              data-row={iy}
              data-order={cell[iy]}
              data-celltype={type(cell[iy])}
              class={tdclass(cell[iy])}
              on:click={(e) => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target)}>
              {#each $pawns as pawnsOf, i}
                {#each pawnsOf.filter((t) => t.loc === cell[iy] && (type(t.loc) === 'safe' ? ix === (i === 0 ? 1 : 3) : true)) as pawn, iP}
                  <div
                    class="pawn"
                    data-owner={pawn.p}
                    data-pawnname={pawn.id}
                    in:receive={{ key: pawn.key }}
                    out:send={{ key: pawn.key }} 
                    class:helpglow={(
                      ( (pawn.p===1?0:1) === $gameState.turn && $gameState.settings.helpmode && !!$gameState.rolled && ($gameState.diceToMove!==0)) ? ( hasMoves((pawn.p===1?0:1),$gameState.diceToMove, pawn.loc) ) : false
                    )}>
                    {pawn.id}
                  </div>
                {/each}
              {/each}
              <!--{cell[iy]}-->
            </td>
          {/if}
        {/each}
      </tr>
    {/each}

  </table>
  <!--
  <div class="deck deck2">
    
    <div class="tetra-dices" class:active={($gameState.turn===1)} >
      
    </div>

  </div>-->
</div>

<Dice bind:this={Wiwi}/>

<nav>
  <button class:modepassive={!$gameState.settings.helpmode} on:click={()=>$gameState.settings.helpmode=!$gameState.settings.helpmode}>{$gameState.settings.helpmode?"help on":"help off"}</button>
  <button on:click={()=>$gameState.view="status"}>log</button>
  <button on:click={()=>$gameState.view="rules"}>rules</button>
</nav>

<div class="status fullscreen" class:visible={$gameState.view==="status"}>
  <nav><button class="closebutton" on:click={()=>$gameState.view=""}>x</button></nav>
  <pre>
Round:<em>{$gameState.round}</em>
it's <em data-player={currentPlayer}>Player {currentPlayer}</em>'s turn
<!--$gameState.turn: <em>{$gameState.turn}</em>-->
<!--dices rolled: <em>{String(!!($gameState.rolled))}</em> & player played: <em>{String(!!($gameState.played))}</em>-->
{@html !!$gameState.rolled ? `<em data-player="${currentPlayer}">Player ${currentPlayer}</em> rolled the Dices` : `<em data-player="${currentPlayer}">Player ${currentPlayer}</em> hasn't rolled yet.`}
<!--{@html ((!($gameState.played) && !!($gameState.rolled))) ? `Waiting for <em>Player ${currentPlayer}</em> to play` : ``}-->
{@html $gameState.status}

  </pre>
</div>

<div class="rules fullscreen" class:visible={$gameState.view==="rules"}>
  <nav><button class="closebutton" on:click={()=>$gameState.view=""}>x</button></nav>
  <article>
  <h1>Royal Game of UR</h1>
  <p>... is a two-player strategy race board game that is ~4500years old.</p>
  <ul><li>When it's your turn, you roll all 4 tetrahedron (like pyramids, but all sides are triangles) shaped dices.</li>
  <li>You count the white marked edges that land on top, and move a pawn of your as many squares. All of the movement has to be done by 1 pawn.</li>
  <li>You can't land on your own pawns.</li>
  <li>You can't land on your opponents pawn if its on the special square in the middle of <strong>War Zone</strong>.</li>
  <li>You pawns are safe so long as they're in the <strong>Safe Zone</strong>, which is <strong>first 4</strong> and <strong>last 2 squares</strong> on your path.</li>
  <li>If you land on one of your opponents pawns, it'll be moved back to the starting point.</li>
  <li>You gain a point when you can move your pawn with your exactly last move out of the board.</li>
  <li>Whoever gets <strong>7 points</strong> first wins!</li>
</ul>
<p>Not clear? OR too intrigued about the history of this game? Then you should watch this video featuring <strong>Irving Finkel</strong>, who discovered the long forgotten Game of UR:<br><a href="https://www.youtube.com/watch?v=WZskjLq040I">Tom Scott vs Irving Finkel: The Royal Game of Ur [25:32]</a></p>
</article>
</div>

{#if !($game.won)}<Dices dicesArr={$gameState.dicesArr} moveToDeck={true} rolled={$gameState.rolled} pos={deckPos} on:click={Wiwi.roll}/>{/if}
<svelte:window bind:scrollY={sY} bind:scrollX={sX} bind:innerWidth={iW} bind:innerHeight={iH} />


<svg id="svgdefs">
    <defs>
     <filter id="sofGlow" height="300%" width="300%" x="-75%" y="-75%">
       <!-- Thicken out the original shape -->
       <feMorphology operator="dilate" radius="4" in="SourceAlpha" result="thicken" ><animate attributeName="radius" values="0;0;0;0;0;3;0;0;0;0;0;4;0;5;0;0;" dur="6s" repeatCount="indefinite"/>
        </feMorphology>
       <!-- Use a gaussian blur to create the soft blurriness of the glow -->
       <feGaussianBlur in="thicken" stdDeviation="10" result="blurred">
        <animate attributeName="stdDeviation" values="0;0;0;0;0;6;0;0;0;0;0;7;1;5;0;0;" dur="6s" repeatCount="indefinite"/>
       </feGaussianBlur>
       <!-- Change the colour -->
       <feFlood flood-color="gold" result="glowColor" />
       <!-- Color in the glows -->
       <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
       <!--	Layer the effects together -->
       <feMerge>
         <feMergeNode in="softGlow_colored"/>
         <feMergeNode in="SourceGraphic"/>
       </feMerge>
     </filter>
     <filter id="glowOnce" height="300%" width="300%" x="-75%" y="-75%">
      <!-- Thicken out the original shape -->
      <feMorphology operator="dilate" radius="0" in="SourceAlpha" result="thicken" ><animate attributeName="radius" values="1;2;0;0;0;0;" dur="1s" repeatCount="indefinite"/>
       </feMorphology>
      <!-- Use a gaussian blur to create the soft blurriness of the glow -->
      <feGaussianBlur in="thicken" stdDeviation="0" result="blurred">
       <animate attributeName="stdDeviation" values="9;3;1;0;0;0;" dur="1s" repeatCount="indefinite"/>
      </feGaussianBlur>
      <!-- Change the colour -->
      <feFlood flood-color="gold" result="glowColor" />
      <!-- Color in the glows -->
      <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
      <!--	Layer the effects together -->
      <feMerge>
        <feMergeNode in="softGlow_colored"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    </defs>
</svg>