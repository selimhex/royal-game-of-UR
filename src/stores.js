import { writable } from 'svelte/store';

export let gameState = writable(
  {
    round: 0,
    turn: 0,
    status: ""
  }
);

let hello  = ()=>{
  console.log("hello");
}
export default {
  hello
}


export let board = writable(
  [{
    col: [
      [13, 14, 0, 0, 1, 2, 3, 4],
      [12, 11, 10, 9, 8, 7, 6, 5],
      [13, 14, 0, 0, 1, 2, 3, 4]
    ]
  },
  {
    col: [
      [{}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}]
    ]
  },
  ]
);


export let pawns = writable(
  [
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
  ]
);
//export let pawns[1] = writable();