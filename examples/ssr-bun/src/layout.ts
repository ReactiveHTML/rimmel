import { route } from "./app/router";

export const layout = (rml, request: Request) => {
	const { body, title } = route(request);

	return rml`<!DOCTYPE html>
		<html>
		<head>
			<title>${title}</title>
			<style>
				body {
					background-color: #333;
					color: #999;
				}
			</style>
		</head>
		<body>
			${body}
		</body>
		</html>
	`;
};
