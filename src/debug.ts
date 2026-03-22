// @ts-nocheck
export const ENABLE_RML_DEBUGGER: boolean =
	// If Vite (or another bundler) replaced the macro, this becomes a literal true/false.
  (typeof __ENABLE_RML_DEBUGGER__ !== 'undefined'
    ? __ENABLE_RML_DEBUGGER__
    : true
	)
;