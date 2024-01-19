// @ts-nocheck

import { CSSDeclaration, CSSProperty, CSSValue } from "../types/css"
import { Sink } from "../types/sink"

export const styleSink: Sink = (node: HTMLElement, key: CSSProperty) =>
    (value: CSSValue<CSSProperty>) => node.style[key] = value

export const styleMultiSink: Sink = (node: HTMLElement) => {
	const style = node.style
	return (kvp: CSSDeclaration) =>
		Object.entries(kvp).forEach(([k, v]) =>
			style[k] = v)
}
