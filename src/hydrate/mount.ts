import { transferAttributes } from './transferAttributes';
// TODO: unmount and unsubscribe as necessary. Some stuff will not need to, because of the WeakSet
export function mount(mutationsList: MutationRecord[]): void {
	mutationsList
		.filter(m => m.type === 'childList')
		.flatMap(m => ([...m.addedNodes as NodeList]))
		.filter(m => m.nodeType == 1) // element
		.flatMap(node => [node as Element].concat(...(node as Element).querySelectorAll('[RESOLVE]')))
		.forEach(transferAttributes)
}
