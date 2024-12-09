/**
 * Get the value of an <input> element matching its type: number, date or string,
 * or innerText if it's any other contenteditable element
**/
export const autoValue = (input: HTMLInputElement | HTMLElement) =>
  (<HTMLInputElement>input).type=='checkbox'
    ? (<HTMLInputElement>input).checked :
  (<HTMLInputElement>input).type=="number"
    ? (<HTMLInputElement>input).valueAsNumber :
  (<HTMLInputElement>input).type == "date"
    ? (<HTMLInputElement>input).valueAsDate :
  (<HTMLInputElement>input).tagName == 'INPUT'
    ? (<HTMLInputElement>input).value :
  (<HTMLInputElement>input).tagName == 'SELECT'
    ? (<HTMLInputElement>input).value
  : (<HTMLElement>input).innerText
;
