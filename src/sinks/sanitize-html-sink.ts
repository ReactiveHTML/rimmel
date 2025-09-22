import type { HTMLString } from '../types/dom';
import type { ExplicitSink, Sink } from "../types/sink";
import type { SinkBindingConfiguration, RMLTemplateExpressions } from "../types/internal";

import { SINK_TAG } from "../constants";

const isElement = (node: Element | DocumentFragment): node is Element => node.nodeType == Node.ELEMENT_NODE;

const sanitizeNode = (node: Element | DocumentFragment) => {
	if(isElement(node)) {
		const forbiddenTags = ['script', 'style', 'iframe', 'object', 'embed'];
		if (forbiddenTags.includes(node.tagName.toLowerCase())) {
			node.remove();
			return;
		}

		const forbiddenAttributes = ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onkeydown', 'onkeypress', 'onkeyup'];
		Array.from(node.attributes).forEach(attr => {
			if (forbiddenAttributes.includes(attr.name.toLowerCase()) || attr.name.toLowerCase().startsWith('on')) {
				node.removeAttribute(attr.name);
			}
		});
	}

	Array.from(node.children).forEach(child => sanitizeNode(child));
};

function sanitizeInput(target: Element, input: HTMLString) {
	const tempElement = document.createElement('div');
	// tempElement.textContent = input;
	tempElement.innerHTML = input;

	const fragment = document.createDocumentFragment();
	fragment.append(...tempElement.childNodes);

	sanitizeNode(fragment);

	target.innerHTML = '';
	target.appendChild(fragment);
}

export const SanitizeSink: Sink<HTMLElement> =
	(e: Element) =>
		sanitizeInput.bind(null, e)
;

	//(html: HTMLString) => sanitizeInput(html, node)

export const Sanitize: ExplicitSink<'textcontent'> =
	(source: RMLTemplateExpressions.HTMLText) =>
		<SinkBindingConfiguration<HTMLElement>>({
			type: SINK_TAG,
			t: 'Sanitize',
			source,
			sink: SanitizeSink,
		})
;
