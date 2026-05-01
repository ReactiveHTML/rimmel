import { homeRoute } from "../routes/home";

export const route = (request: Request) => {
	const path = request.url;
	switch(path) {
		case '/':
			return homeRoute();
	}
}