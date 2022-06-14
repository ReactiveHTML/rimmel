const { Subject } = rxjs
const { distinct, filter, map, mapTo, merge, take, share, startWith, takeUntil, tap, withLatestFrom } = rxjs.operators
import {render} from '../../src/index.js'

function* newGame() {
	const counters = Array(8).fill(0)
	const winningLines = [[[0,3,6], [0,4], [0,5,7]], [[1,3], [1,4,6,7], [1,5]], [[2,3,7], [2,4], [2,5,6]]]
	for(var piece = 0, state, end = false, x, y, move = yield {piece, x, y, end, counters}; !end; piece = +!piece) {
		winningLines[move.y][move.x].forEach(c=>counters[c] += 1-2*piece)
		end = counters.some(x=>Math.abs(x)==3)
		state = {piece, x: move.x, y: move.y, end, counters}
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
	const action = new Subject().pipe(
		distinct(({x, y})=>`${x}${y}`),
		share(),
	)

	const state = action.pipe(
		map(m=>move.next(m)),
		share(),
	)

	const gameOver = state.pipe(
		filter(x=>x.done),
		share(),
	)

	const Board = () => render`<table>${[0,1,2].map(Row)}</table>`
	const Row = y => render`<tr>${[0,1,2].map(x=>Cell(x,y))}</tr>`
	const Cell = (x, y) => {
		const isWinningCell = (c, i)=> Math.abs(c)==3&&(i<3&&i==y || i<6&&x==i-3 || i==6&&x==y || i==7&&y==2-x)
		const click = new Subject().pipe(
			tap(()=>action.next({x, y})),
			withLatestFrom(state),
			map(([, {value: {piece}}])=>PAWNS[piece]),
			take(1),
		)

		const disabled = click.pipe(
			merge(gameOver),
			map(()=>({disabled: 'disabled'})),
			startWith(()=>({})),
		)

		const highlight = gameOver.pipe(
			withLatestFrom(state),
			map(([, state])=>({highlight: state?.value?.counters.map(isWinningCell).some(x=>x)})),
		)
		return render`<td><button onclick="${click}" class="cell ${highlight}" ...${disabled} data-move="${click}"></button></td>`
	}

	document.body.innerHTML = render`
		<h1>Tic Tac Toe</h1>
		${Board()}
		<div>Next : <span>${state.pipe(map(x=>x.done && ' - ' || PAWNS[1-x.value.piece]), startWith(PAWNS[0]))}</span></div>
		<div>State: <span>${action.pipe(takeUntil(gameOver), merge(gameOver.pipe(mapTo({done: true}))), map(x=>x.done?"Game Over":"Playing"), startWith('Ready'))}</span></div>
	`
}

onload = App

