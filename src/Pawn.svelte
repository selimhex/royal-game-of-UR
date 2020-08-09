<script>
  import { gameState, board, pawns } from "./stores.js";
  let residingPawn;
  const qS = (a) => {
    return document.querySelector(a);
  };
  const qA = (a) => {
    return document.querySelectorAll(a);
  };

  export let col;
  export let loc;
  let owner;
  let type = function (c) {
    return c < 5 || 12 < c ? "safe" : "combat";
  };

  let spotPawn = function () {
    //if (type(loc) === "safe")
    return true;
    return $pawns[0].find((e) => e.loc === loc);
  };
  let aPawnSpotted;
  let Paw;

  $: {
    for (let i = 0; i < 2; i++) {
//      console.log($pawns[i]);
      let p = $pawns[i];
//      if ($pawns[i] === 2) break;

      if (type(loc) === "safe") {
        owner = col === 0 ? 1 : 2;
        aPawnSpotted = p.find((e) => (e.loc === loc && e.p === owner));
      } else {
        aPawnSpotted = p.find((e) => e.loc === loc);
      }
      //aPawnSpotted = p.find((e) => e.loc === loc && e.p === owner);
      if (!!aPawnSpotted) {
        console.log(
          "PAWN SPOTTED",
          owner,
          aPawnSpotted.p,
          aPawnSpotted.id,
          aPawnSpotted.loc
        );
        //Paw = aPawnSpotted;
        break;
      }

    }
  }

  //    aPawnSpotted = $pawns[0].find((e) => e.loc === loc);
</script>

<!--col:{col}
<br />
loc:{loc}
<br />-->

{#if aPawnSpotted !== undefined}
  <div class="pawn" data-owner={aPawnSpotted.p} data-pawnname={aPawnSpotted.id}>
    {aPawnSpotted.id}
  </div>
{/if}
