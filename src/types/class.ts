import { MaybeFuture } from "./futures";

/**
 * A valid class name, which can be used in CSS
 */
export type ClassName = string & { readonly __isValidClassName: unique symbol; };

// Type guard to check if a string is a valid class name
export const isValidClassName = (name: string): name is ClassName =>
    // Regular expression to match valid HTML class names:
    /^[^\s\d!-/:-@[-`{-~][^\s!-/:-@[-`{-~]*$/.test(name)
    // No spaces, no special characters, and not starting with a digit
    ;

export type ClassAttribute = {
    // TODO: support 3-state with toggle
    [className: string]: MaybeFuture<boolean>;
};
