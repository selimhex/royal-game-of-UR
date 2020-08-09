<script>
  import { gameState, board, pawns } from "./stores.js";
  let content;
  const qS = (a) => {
    return document.querySelector(a);
  };
  const qA = (a) => {
    return document.querySelectorAll(a);
  };

  let type = function (c) {
    return c < 5 || 12 < c ? "safe" : "combat";
  };

  let mayItPlay = function (owner) {
    return (
      $gameState.rolled == 1 &&
      $gameState.played == 0 &&
      $gameState.turn == owner
    );
  };
  let nextTurn =function(){
    $gameState = {
      turn: ($gameState.turn + 1) %2,
      rolled:0,
      played: 0,
      round: $gameState.round + 1
    };
    console.log("NEXT TURN");
  }
  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  let move = function (owner, id, thisPawn) {
    console.log(mayItPlay(owner));
    if (mayItPlay(owner)) {
      let col;
      const index = $pawns[owner].findIndex((item) => item.id === Number(id));
      const pawnObj = $pawns[owner][index];
      const orderToGo = pawnObj.loc + $gameState.diceToMove;
      console.log(orderToGo, owner, pawnObj.id, pawnObj.loc);
      if (
        pawnObj.loc + $gameState.diceToMove < 5 ||
        12 < pawnObj.loc + $gameState.diceToMove
      ) {
        console.log("check col", owner);
        col = Number((owner==0)?0:2);
      } else {
        col = 1;
      }
      console.log("that cell", col, orderToGo);
      const cellToGo = qS(
        `table td[data-col="${col}"][data-order="${orderToGo}"]`
      );
      const boardindex = $board[0].col[`${col}`].findIndex(
        (item) => item === Number(orderToGo)
      );
      console.log(boardindex);
      console.log($board[1].col[col][boardindex]);
      if (!isEmpty($board[1].col[col][boardindex])) {
        console.log("// CELL PROBABLY HAS A PAWN");
        //
      } else {
        console.log("MOVING PAWN");
        $pawns[owner][index].loc = orderToGo;
        $board[1].col[col][boardindex].owner = owner;
        $board[1].col[col][boardindex].id = id;
        $gameState.played = 1;
        nextTurn();

        //cellToGo.appendChild(thisPawn);
      }
      //console.log(cellToGo, thisPawn, cellToGo.append(thisPawn));
    }
  };
</script>

<div class="board">
  <div
    class="pawns pawns1"
    on:click={(e) => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target)}>
    {#each $pawns[0] as pawn, i (pawn.id)}
      {#if pawn.loc == 0}
        <div class="pawn" data-owner="0" data-pawnname={pawn.id}>{pawn.id}</div>
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
              on:click={(e) => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target)}>
              <!--{console.log ($board[1].col[`${ix}`][`${iy}`])}-->
              {#if $board[1].col[`${ix}`][`${iy}`].owner}
                <div
                  class="pawn"
                  data-owner={$board[1].col[`${ix}`][`${iy}`].owner}
                  data-pawnname={$board[1].col[`${ix}`][`${iy}`].id}>
                  {$board[1].col[`${ix}`][`${iy}`].id}
                </div>
              {/if}
              {cell[iy]}
            </td>
          {/if}
        {/each}
      </tr>
    {/each}

  </table>
  <div class="pawns pawns2" on:click={(e) => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target)}>
    {#each $pawns[1] as pawn, i (pawn.id)}
      {#if pawn.loc == 0}
        <div class="pawn" data-owner="1" data-pawnname={pawn.id}>{pawn.id}</div>
      {/if}
    {/each}
  </div>
</div>
