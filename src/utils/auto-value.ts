/**
 * Get the value of an <input> element matching its type:
 * boolean, number, date or string,
 * or innerText if it's any other (e.g.: [contenteditable]) element
 **/
export const autoValue = (input: HTMLInputElement | HTMLElement) =>
	(<HTMLInputElement>input).type=='checkbox'
		? (<HTMLInputElement>input).checked :
	(<HTMLInputElement>input).type=="number"
		? (<HTMLInputElement>input).valueAsNumber :
	(<HTMLInputElement>input).type == "date"
		? (<HTMLInputElement>input).valueAsDate :
	((<HTMLInputElement>input).value ?? (<HTMLElement>input).innerText)
;
