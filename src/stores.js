import { writable } from 'svelte/store';

export let gameState = writable(
  {
    round: 1,
    turn: 0,
    rolled: 0,
    status: "",
    dicesArr: [0,0,0,0]
  }
);

export let game = writable(
  {
    points: [],
    won: null
  }
);



export let board = writable(
  [{
    col: [
      [13, 14, 15, 0, 1, 2, 3, 4],
      [12, 11, 10, 9, 8, 7, 6, 5],
      [13, 14, 15, 0, 1, 2, 3, 4]
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

let key = 1;
export let pawns = writable(
  [
    [
      { loc: 0, p: 1, id: 1, key: key++ },
      { loc: 0, p: 1, id: 2, key: key++ },
      { loc: 0, p: 1, id: 3, key: key++ },
      { loc: 0, p: 1, id: 4, key: key++ },
      { loc: 0, p: 1, id: 5, key: key++ },
      { loc: 0, p: 1, id: 6, key: key++ },
      { loc: 0, p: 1, id: 7, key: key++ }
    ],
    [
      { loc: 0, p: 2, id: 1, key: key++ },
      { loc: 0, p: 2, id: 2, key: key++ },
      { loc: 0, p: 2, id: 3, key: key++ },
      { loc: 0, p: 2, id: 4, key: key++ },
      { loc: 0, p: 2, id: 5, key: key++ },
      { loc: 0, p: 2, id: 6, key: key++ },
      { loc: 0, p: 2, id: 7, key: key++ }
    ]
  ]
);
//export let pawns[1] = writable();