<script>
  import { gameState, board, pawns } from "./stores.js";
  import Pawn from "./Pawn.svelte";
  import ScoreBoard from "./ScoreBoard.svelte";

  import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

  let content;
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
    return (c === 8 || c === 4) ? "special" : "";
  };

  let spotPawn = function (celliy) {
    return $pawns[0].find((e) => e.loc === celliy);
  };

  let mayItPlay = function (owner) {
    return (
      $gameState.rolled == 1 && $gameState.played == 0 && currentPlayer == owner
    );
  };
  let nextTurn = function (doubledice=false) {
    $gameState = {
      turn: ($gameState.turn + (doubledice? 0 : 1)) % 2,
      rolled: 0,
      played: 0,
      round: $gameState.round + 1,
      status: $gameState.status + "\n...next turn...",
      dicesArr: [0,0,0,0]
    };
    console.log("NEXT TURN");
  };
  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  let move = function (owner, id, thisPawn) {
    let ownerID = owner - 1;
    console.log(mayItPlay(owner)? `${owner} may play` : `${owner} may not play`);
    if (mayItPlay(owner)) {
      let col;
      // ###### FIX findIndex -> find ?!?!?!??! ####
      const index = $pawns[ownerID].findIndex((item) => item.id === Number(id));
      const pawnObj = $pawns[ownerID][index];
      const orderToGo = pawnObj.loc + $gameState.diceToMove;
      console.log(orderToGo, owner, pawnObj.id, pawnObj.loc);
      let found, foundOwn, foundOpponent;
      let foundBool,
        foundOwnBool,
        foundOpponentBool,
        canMoveBool = true;
      if (type(orderToGo) === "safe") {
        col = Number(owner == 1 ? 0 : 2);
        console.log("check col", col);
        if (orderToGo === 15) {
          pawnObj.loc = 15;
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
        col = 1;
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

      console.log("that cell", col, orderToGo);

      // ############## I CAN MOVE FREELY  ##############
      if (!found && !foundOwn && !foundOpponentBool && canMoveBool) {
        console.log("MOVING PAWN");
        $gameState.status += `\nPlayer <em data-player="${currentPlayer}">${currentPlayer}</em>'s Pawn #<em data-player="${currentPlayer}">${pawnObj.id}</em> moving to square <em>${orderToGo}</em>`;
        if (orderToGo === 8) {
          $gameState.status += `\nPawn is now <em>Untouchable</em>!`;
        }
        if (orderToGo === 8 || orderToGo === 4) {
          $gameState.status += `\n<em data-player="${currentPlayer}">${currentPlayer} gets to play again!</em>`;
        }
        $pawns[ownerID][index].loc = orderToGo;
        $gameState.played = 1;
        nextTurn((orderToGo === 8 || orderToGo === 4)? true:false);
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
      $gameState.status += (owner !== undefined) ? `\nit's not Player <em>${owner}</em>'s turn!.` : `\nno pawns there!`
      //$gameState.status += `\nit's not your turn!.`;
      //console.log(`it's not your turn!.`);
    }
  };
</script>

<div class="board">
  <div
    class="pawns pawns1"
    on:click={(e) => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target)}>
    {#each $pawns[0].filter(t => t.loc===0) as pawn (pawn.id)}

        <div class="pawn" data-owner={pawn.p} data-pawnname={pawn.id} in:receive="{{key: pawn.key}}" out:send="{{key: pawn.key}}" animate:flip>
          {pawn.id}
        </div>
    {/each}

  </div>
  <table>

    {#each $board[0].col[0] as row, iy}
      <tr>
        {#each $board[0].col as cell, ix}
          {#if cell[iy] == '15'}
            <td class="none">
              <ScoreBoard col={ix}/>
            </td>
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
                {#each pawnsOf.filter(t => t.loc===cell[iy] && 
                    (
                      (type(t.loc) === "safe") ? ix === ( (i===0) ? 0 : 2 ) : true 
                    )
                  ) as pawn, iP}
              <div class="pawn" data-owner={pawn.p} data-pawnname={pawn.id} in:receive="{{key: pawn.key}}"
              out:send="{{key: pawn.key}}"
              >
                {pawn.id}
              </div>
                {/each}
              {/each}
              {cell[iy]}
            </td>
            
          {/if}
        {/each}
      </tr>
    {/each}

  </table>
  <div
    class="pawns pawns2"
    on:click={(e) => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target)}>
    {#each $pawns[1].filter(t => t.loc===0) as pawn (pawn.id)}

    <div class="pawn" data-owner={pawn.p} data-pawnname={pawn.id} in:receive="{{key: pawn.key}}"
    out:send="{{key: pawn.key}}" animate:flip>
      {pawn.id}
    </div>
    {/each}
  </div>
</div>
