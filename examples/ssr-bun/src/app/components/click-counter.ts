import { BehaviorSubject, scan } from "rxjs";
import { rml } from "../../../../../src/ssr";

export const ClickCounter = (initial=0) => {

	// TODO #298762346629836:
	// If we can identify this stream as pure, we can send it to the client and bind it E2E
	// Same if it's impure with front-end effects.
	// Should be kept here and perhaps exposed with some RPC if it's impure with server effects
	const count = new BehaviorSubject(initial).pipe(
		scan(x=>x+1)
	);
	
	return rml`
		<div>
			<button onclick="${count}">Click</button>
			<span>${count}</span>
		</div>
	`;
};
