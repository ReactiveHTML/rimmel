import { InnerHTML } from "../../../src/sinks/inner-html-sink";
import { rml } from "../../../src/ssr";

export const layout = ({ request, content }) => rml`
<html>
<head>
	<style>
		body {
			background-color: #333;
			color: #999;
		}
	</style>
</head>
<body>
${route(request)}
`;

// </body>
// </html>
