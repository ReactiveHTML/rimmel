import { mount } from './mount';

export function hydrate(root: HTMLElement): MutationObserver {
  const observer = new MutationObserver(mount);
  observer.observe(root, { attributes: false, childList: true, subtree: true });
  
  return observer;
}
