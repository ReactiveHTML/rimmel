import { route } from "./app/router";

export const layout = (rml, request: Request) => rml`
<html>
<head>
	<title>How do we set the title?</title>
	<style>
		body {
			background-color: #333;
			color: #999;
		}
	</style>
</head>
<body>
	${route(request)}
</body>
</html>
`;
