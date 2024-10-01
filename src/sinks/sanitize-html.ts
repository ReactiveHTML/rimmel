import type { HTMLString } from '../types/dom';
import type { ExplicitSink, Sink } from "../types/sink";
import type { SinkBindingConfiguration, RMLTemplateExpressions } from "../types/internal";

import { SINK_TAG } from "../constants";

const sanitizeNode = (node) => {
  if (node.nodeType === Node.ELEMENT_NODE) {
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

  Array.from(node.childNodes).forEach(child => sanitizeNode(child));
};


function sanitizeInput(input: HTMLString, target: Element) {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = input;
  const fragment = document.createDocumentFragment();
  fragment.append(...tempElement.childNodes);

  sanitizeNode(fragment);

  target.innerHTML = '';
  target.appendChild(fragment);
}

const SanitizeSink: Sink<HTMLElement> = node =>
  (html: HTMLString) => sanitizeInput(html, node)
;

export const Sanitize: ExplicitSink<'textcontent'> = (source: RMLTemplateExpressions.HTMLText) =>
  <SinkBindingConfiguration<HTMLElement>>({
    type: SINK_TAG,
    source,
    sink: SanitizeSink,
  })
;

