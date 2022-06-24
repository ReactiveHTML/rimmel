// N.B.: We'll refer to Rx Subjects just as "streams"
const { Subject } = rxjs
const { distinct, filter, map, mapTo, merge, take, share, startWith, switchMap, takeUntil, tap, withLatestFrom } = rxjs.operators
import {render} from '../../src/index.js'

// There are so few ways to win this game we can list them all.
const winningLines = [
	[ [0,3,6],    [0,4],    [0,5,7] ],
	[  [1,3],   [1,4,6,7],   [1,5]  ],
	[ [2,3,7],    [2,4],    [2,5,6] ],
]

// We see a game as a stream of events, from start, through a number of moves, until a win or a draw happens
// So we've chosen a generator function for that
function* newGame() {
	// Here we count the length of sequences of the same piece in each direction. We have 4 directions | - \ /, 2-ways each
	// When one or more of these hits +3 or -3, it's a win.
	// One type of piece will add +1 to the line-counter, the other -1
	const counters = Array(8).fill(0)

	// This is the whole game sequence, move-by-move
	// Note how we start yielding immediately the "move" variable, which will be filled back-in lower down
	// by the "state" stream, when a user makes a move
	for(var piece = 0, moves = 0, state, end = false, x, y, move = yield {piece, x, y, end, counters, moves}; ; piece = +!piece, moves++) {
		winningLines[move.y][move.x].forEach(c=>counters[c] += 1-2*piece)
		end = moves == 8 || counters.some(x=>Math.abs(x)==3)
		state = {piece, x: move.x, y: move.y, end, counters, moves}
		if(end)
			return state
		else
			move = yield state
	}
}

function App() {
	const PAWNS = ['X', 'O']
	const move = newGame()
	move.next()
	// an action just emits the coordinates of the move
	const action = new Subject().pipe(
		distinct(({x, y})=>`${x}${y}`),
		share(),
	)

	// then we play the move through the game loop (the generator) above and get the next state
	const state = action.pipe(
		map(m=>move.next(m)),
		share(),
	)

	// a simple filter over the state to tell when it's over
	const gameOver = state.pipe(
		filter(x=>x.done),
		share(),
	)

	// A board component to render each row
	const Board = () => render`<table>${[0,1,2].map(Row)}</table>`

	// A Row component to render each cell
	const Row = y => render`<tr>${[0,1,2].map(x=>Cell(x,y))}</tr>`

	// A Cell component that handles user clicks
	const Cell = (x, y) => {
		// this formula tells if the current cell is part of a winning line
		const isWinningCell = (c, i) => Math.abs(c)==3 && (i<3&&i==y || i<6&&x==i-3 || i==6&&x==y || i==7&&y==2-x)

		// When a cell is clicked, perform the next action and render a piece
		const click = new Subject().pipe(
			tap(()=>action.next({x, y})),                  // <-- trigger the next action as a side effect
			withLatestFrom(state),                         // <-- but return the update state after that
			map(([, {value: {piece}}])=>PAWNS[piece]),     // <-- and then emit the new piece that moves
			take(1),                                       // <-- but allow at most one piece per cell
			share(),
		)

		// Disable cells that have been occupied by emitting a {disabled: disabled} object
		// that will sink as a disabled="disabled" attribute of the cell element
		const disable = gameOver.pipe( // <-- when the game is over
			map(()=>({disabled: 'disabled'})), // <-- emit "disabled" (this will make a cell disabled)
			share(),
		)

		// When a player wins, highlight the winning cells by emitting a { highlight: true } object that will
		// sink directly into the class attribute of the cell element
		const highlight = state.pipe( // <-- when the game is over
			map(state=>({
				highlight: 
				state.value.counters // <-- emit { highlight: true | false }
					.map(isWinningCell) // <-- if the cell is part of
					.some(x=>x) // <-- at least one winning line (multiple can cross each-other)
			})),
			// <-- and finally this will add/remove the "highlight" class to the cell, lower down
		)

		// And this is the actual cell.
		return render`<td><button onclick="${click}" class="cell ${highlight}" data-move="${click}" ${disable}></button></td>`
		// "onclick" emits into the "click" stream above
		// the "highlight" stream above is sinked into the class attribute
		// the "click" stream above is also sinked into a data element (this will cause the current move
		//     to display via CSS with the "content: attr(data-move)" rule)
	}

	const winner = gameOver.pipe(
		map(x=>x.value.moves < 8
			? `Winner: ${PAWNS[x.value.piece]}`
			: `DRAW`
		),
	)

	// And finally we render the main scene
	// a Board component as defined above
	// then some reporting below:
	//   - the "state" stream sinks into the <span> element, telling who's next
	//   - the "action" stream just sinks into the last <span> to indicate the current state: Ready | Playing | Game Over
	document.body.innerHTML = render`
		<h1>Tic Tac Toe</h1>

		${Board()}

		<div>Next : <span>${state.pipe(map(x=>x.done && ' - ' || PAWNS[1-x.value.piece]), startWith(PAWNS[0]))}</span></div>
		<div>State: <span>${action.pipe(takeUntil(gameOver), merge(gameOver.pipe(mapTo({done: true}))), map(x=>x.done?"Game Over":"Playing"), startWith('Ready'))}</span></div>
		<div>${winner}</div>
	`
}

onload = App

