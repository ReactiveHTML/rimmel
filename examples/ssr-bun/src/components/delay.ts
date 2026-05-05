import { HTMLString } from "../../../../src/types";

export const Delay = (timeout: number, content: string | number | HTMLString) => {
	const p = new Promise<HTMLString>((resolve) => {
		setTimeout(()=>resolve(content), timeout);
	});
	
	return p;
};
