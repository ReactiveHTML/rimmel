import type { Future, MaybeFuture } from './futures';

export type CSSProperty = Omit<keyof CSSStyleDeclaration, 'length' | 'parentRule'>;

// export type CSSValue<T extends keyof CSSStyleDeclaration> = string | number | undefined;
// export type CSSValue<T extends keyof CSSStyleDeclaration> = unknown; //typeof CSSStyleDeclaration[T];
export type CSSValue<T extends keyof CSSStyleDeclaration> = CSSStyleDeclaration[T];

export type CSSDeclaration = {
    [K in keyof CSSStyleDeclaration]?: NonNullable<CSSValue<K>>;
};

// export type CSSWritableDeclaration = {
//   [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string | number | null ? K : never]?: NonNullable<CSSValue<K>>;
// };

export type CSSWritableDeclaration = {
  [K in keyof CSSStyleDeclaration as IsWritable<K>]?: NonNullable<CSSValue<K>>;
};

// Helper type to check if a property is writable
type IsWritable<K extends keyof CSSStyleDeclaration> = 
  { -readonly [P in K]: CSSStyleDeclaration[K] } extends { [P in K]: CSSStyleDeclaration[K] } 
  ? K 
  : never
;

export type CSSWritableProperty = Omit<CSSWritableDeclaration, 'length' | 'parentRule'>;

export type CSSClassName = string & { _CSSClassNameBrand: never };
// const isValidCSSClassName = (name: string): name is CSSClassName => /^[_a-zA-Z][_a-zA-Z0-9-]*$/.test(name);


export type CSSFuture = {
    [P in keyof CSSStyleDeclaration]?: MaybeFuture<CSSStyleDeclaration[P]>
  };

/**
 * Just a friendly alias for CSSStyleDeclaration
 */
export type CSSObject = CSSDeclaration | CSSFuture;

/**
 * Just a friendly alias for CSSStyleDeclaration
 */
export type StyleObject = CSSFuture;
