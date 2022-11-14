import { ClassSet } from './types';

export function isFunction (fn: any): boolean {
  return typeof fn == 'function';
}

export const getEventName = (eventAttributeString: string) => ((/\s+on(?<event>\w+)=['"]?$/.exec(eventAttributeString) || {}).groups || {}).event;
// GOTCHA: attributes starting with "on" will be treated as event handlers -------> HERE <---, so don't do <tag ongoing="trouble">
export const getEventNameWithoutOn = (eventAttributeString: string) => eventAttributeString.replace(/^on/, '');

// set classes from an object {cls: <non falsy value>, cls2: undefined}
export const setClasses = (node: HTMLElement, classset: ClassSet) => Object.entries(classset).forEach(([k, v])=>v?node.classList.add(k):node.classList.remove(k));

// export const setDataset = (node: HTMLElement, dataset: ClassSet) => Object.entries(dataset).forEach(([k, v])=>typeof v == 'undefined' ? node.dataset[k] : node.dataset[k = v])