<script>
  import { gameState, board, pawns } from "./stores.js";
  import Pawn from "./Pawn.svelte";
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
    return (c===8) ? "special" : "";
  };
  

  let spotPawn = function (celliy) {
    return $pawns[0].find((e) => e.loc === celliy); 
  };

  let mayItPlay = function (owner) {
    return (
      $gameState.rolled == 1 &&
      $gameState.played == 0 &&
      currentPlayer == owner
    );
  };
  let nextTurn = function () {
    $gameState = {
      turn: ($gameState.turn + 1) % 2,
      rolled: 0,
      played: 0,
      round: $gameState.round + 1,
      status: $gameState.status + "\n...next turn...",
    };
    console.log("NEXT TURN");
  };
  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  /*
    const array1 = [{ a: "1", b: "b" }, { a: "1", b: "c" }, 12, 8, 130, 44];
    let isCellFull = function (loc, owner) {
      if (type(loc) === "safe") {
        let isObj = $pawns[owner].find((o, i) => {
          o.loc === loc;
        });
      } else {
        //check opponent first
        //check self later
      }
      let obj = $pawns[0].find((o, i) => {
        if (o.loc === "string 1") {
          $pawns[0][i] = { name: "new string", value: "this", other: "that" };
          return true; // stop searching
        }
      });
    };
  */

  let move = function (owner, id, thisPawn) {
    let ownerID = owner - 1;
    console.log(mayItPlay(owner));
    if (mayItPlay(owner)) {
      let col;
      const index = $pawns[ownerID].findIndex((item) => item.id === Number(id));
      const pawnObj = $pawns[ownerID][index];
      const orderToGo = pawnObj.loc + $gameState.diceToMove;
      console.log(orderToGo, owner, pawnObj.id, pawnObj.loc);
      let found, foundOwn, foundOpponent;
      if (type(pawnObj.loc + $gameState.diceToMove) === "safe") {
        col = Number(owner == 1 ? 0 : 2);
        console.log("check col", col);
        found = $pawns[ownerID].find((e) => e.loc === orderToGo);
        found = found !== null && found !== undefined ? true : false;
        if (found) {
          $gameState.status = `<em>Player ${
            owner
          }'s </em> own pawn is there.`;
        } else {
          // DO A COMMON NOT FOUND
        }
      } else {
        // !!!!!!!!!!!!!!!!!! ITS COMBAT ZONE!!!!!!!!!!!!!!!!!!
        col = 1;
        foundOpponent = $pawns[(ownerID + 1) % 2].find(
          (e) => e.loc === orderToGo
        );
        foundOpponent =
          foundOpponent !== null && foundOpponent !== undefined ? true : false;
        if (foundOpponent) {
          $gameState.status = `Opponent <em>Player ${
            ((ownerID + 1) % 2) + 1
          }'s </em> pawn is there.`;
        }
        foundOwn = $pawns[ownerID].find((e) => e.loc === orderToGo);
        foundOwn = foundOwn !== null && foundOwn !== undefined ? true : false;
      }

      console.log("that cell", col, orderToGo);
      //const cellToGo = qS(`table td[data-col="${col}"][data-order="${orderToGo}"]`);
      //const boardindex = $board[0].col[`${col}`].findIndex((item) => item === Number(orderToGo));
      /*
        console.log(boardindex);
        console.log($board[1].col[col][boardindex]);
        if (!isEmpty($board[1].col[col][boardindex])) {
          console.log("// CELL PROBABLY HAS A PAWN");
          //
        }
      */
      // ############## I CAN MOVE FREELY  ##############
      if (!found && !foundOwn && !foundOpponent) {
        console.log("MOVING PAWN");
        $gameState.status += `\nPlayer <em>${currentPlayer}</em>'s Pawn #<em>${pawnObj.id}</em> moving to square <em>${orderToGo}</em>`;
        $pawns[ownerID][index].loc = orderToGo;
        $gameState.played = 1;
        nextTurn();
        //$board[1].col[col][boardindex].owner = owner;
        //$board[1].col[col][boardindex].id = id;

        //cellToGo.appendChild(thisPawn);
      }
      //console.log(cellToGo, thisPawn, cellToGo.append(thisPawn));
    } else {
      $gameState.status += `\nit's not your turn!.`;
      console.log(`it's not your turn!.`);
    }
  };
</script>

<div class="board">
  <div
    class="pawns pawns1"
    on:click={(e) => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target)}>
    {#each $pawns[0] as pawn, i (pawn.id)}
      {#if pawn.loc == 0}
        <div class="pawn" data-owner="1" data-pawnname={pawn.id}>{pawn.id}</div>
      {/if}
    {/each}

  </div>
  <table>

    {#each $board[0].col[0] as row, iy}
      <tr>
        {#each $board[0].col as cell, ix}
          {#if cell[iy] == '0'}
            <td class="none" />
          {:else}
            <td
              data-col={ix}
              data-row={iy}
              data-order={cell[iy]}
              data-celltype={type(cell[iy])}
              class={ tdclass(cell[iy]) }
              on:click={(e) => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target)}>
              <Pawn col={ix} loc={cell[iy]}/>
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
    {#each $pawns[1] as pawn, i (pawn.id)}
      {#if pawn.loc == 0}
        <div class="pawn" data-owner="2" data-pawnname={pawn.id}>{pawn.id}</div>
      {/if}
    {/each}
  </div>
</div>
