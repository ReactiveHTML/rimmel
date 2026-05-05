import { interval, take } from "rxjs";
import { rml } from "../../../../src/ssr";

export const AutoInc = (limit: number) => {
	const count = interval(1000).pipe(
		take(limit),
	);
	
	return rml`
		<div>
			AutoInc: <span>${count}</span>
		</div>
	`;
};
