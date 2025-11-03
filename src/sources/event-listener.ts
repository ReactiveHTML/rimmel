import { addListener } from "../lib/addListener";
import type { RMLEventListener, HTMLEventName } from "../types/dom";

export const eventListnerSource = (
  node: HTMLElement,
  eventName: HTMLEventName,
  handler: RMLEventListener,
  options?: AddEventListenerOptions
) => {
  return addListener(node, eventName, handler, options);
};
