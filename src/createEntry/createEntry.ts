import { hydrate } from '../hydrate';

export function createEntry(html: string, root?: HTMLElement) {
  let observer: MutationObserver | null = null;

  return Object.freeze({
    mount() {
      if (root) {
        observer = hydrate(root);
        return;
      }
      
      return html;
    },
    unmount() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    },
  });
}
