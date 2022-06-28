const { Subject, fromEvent } = rxjs
const { map, share, switchMap, takeUntil, tap } = rxjs.operators

const mouseup = fromEvent(window, 'mouseup')
	.pipe(share())
const mousemove = fromEvent(window, 'mousemove')
	.pipe(share())

export const Draggable = () => {
	const drag = new Subject()
		.pipe(
			tap(e=>e.preventDefault()),
			switchMap(e => {
				const { left: l, top: t } = e.target.style
				const px = e.clientX -parseFloat(l || 0)
				const py = e.clientY -parseFloat(t || 0)
				return mousemove.pipe(
					map(e=>({left: `${e.clientX -px}px`, top: `${e.clientY -py}px`})),
					takeUntil(mouseup),
				)
			}),
		)

	return {
		class: 'draggable',
		onmousedown: drag,
		style: drag,
	}
}

