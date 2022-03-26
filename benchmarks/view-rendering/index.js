import { render } from '../../dist/rxhtml.es.js';
const { Subject, BehaviorSubject } = rxjs;
const { map, scan } = rxjs.operators

const view1 = () => {
	const counter = (new BehaviorSubject(0)).pipe(
		scan(a=>a+1)
	)
	return render`
		<h1>View 1</h1>
		<p>This is <strong>view1</strong>. It does some stuff, etc</p>
		<p>This is <strong>view1</strong>. It does some stuff, etc</p>
		<p>This is <strong>view1</strong>. It does some stuff, etc</p>
		<button type="button" onclick="${counter}"> Click me </button>
		You clicked the button <span>${counter}</span> times.
	`
}

const view2 = () => {
	const counter = (new BehaviorSubject(0)).pipe(
		scan(a=>a+1)
	)
	return render`
		<h1>View 2</h1>
		<button type="button" onclick="${counter}"> Click me </button>
		<p>This is <stron>view2</strong>. It does some more stuff, etc</p>
		<p>This is <stron>view2</strong>. It does <button onclick="${()=>alert('you clicked me')}">some more stuff</button>, etc</p>
		<p>This is <stron>view2</strong>. It does some more stuff, etc</p>
		You clicked the button <span>${counter}</span> times.
	`
}

function run() {
	const currentView = new Subject()
	const views = [view1, view2]
	const renderCount = currentView.pipe(
		map(x=>1),
		scan(a=>a+1),
	)

	let idx = 0

	const changeView = () => {
		currentView.next(views[idx])
		idx = (idx+1)%views.length
		requestAnimationFrame(changeView)
	}

	document.body.innerHTML = render`
		<span style="color: red;"  onmouseover="${()=>currentView.next(view1())}">render view 1</span>
		<span style="color: blue;" onmouseover="${()=>currentView.next(view2())}">render view 2</span>
		<br>
		${[...Array(20).fill(0)].map((x,i)=>render`
			<span style="color: red;" onmouseover="${()=>currentView.next(views[i&1]())}">X <span>${renderCount}</span></span>
		`)}
		${[...Array(20).fill(0)].map((x,i)=>render`
			<span style="color: red;" onmouseover="${()=>currentView.next(views[i&1]())}">Y <span>${renderCount}</span></span>
		`)}

		<div id="target">
			${currentView}
		</div>
		<div>You changed view <span>${renderCount}</span> times.
		`

	changeView()
}

run()

