/**
 * Get the value of an <input> element matching its type: number, date or string.
**/
export const autoValue = (input: HTMLInputElement) =>
  input.type=="number"
    ? input.valueAsNumber :
  input.type == "date"
    ? input.valueAsDate :
  input.value
;
