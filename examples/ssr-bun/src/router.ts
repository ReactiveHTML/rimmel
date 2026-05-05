import { homeRoute } from "./routes/home";

export const route = (request: Request) => {
	const url = new URL(request.url);
	const path = url.pathname;

	switch(path) {
		case '/':
		default:
			return homeRoute();
	}
}