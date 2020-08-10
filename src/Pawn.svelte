<script>
  import { gameState, board, pawns } from "./stores.js";
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
  let key;
{
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
        aPawnSpotted.key=aPawnSpotted.p +""+ aPawnSpotted.id;
        key=aPawnSpotted.p +""+ aPawnSpotted.id;
        console.table(
          "PAWN onboard!","" ,
          "owner:", aPawnSpotted.p,"",
          "id:", aPawnSpotted.id,"",
          "loc:", aPawnSpotted.loc,""
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
<!--in:receive="{{key: aPawnSpotted.id}}"
  out:send="{{key: aPawnSpotted.id}}"-->
<!--in:receive="{{key: pawn.p +" "+ pawn.id}}"
        out:send="{{key: pawn.p +" "+ pawn.id}}"-->
<!--<div class="pawn" data-owner={aPawnSpotted.p} data-pawnname={aPawnSpotted.id} in:receive="{{key: key}}"
out:send="{{key: key}}">
{aPawnSpotted.p}.{aPawnSpotted.id}.{key}.{aPawnSpotted.loc}
  </div>-->
{/if}
