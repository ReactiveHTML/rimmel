export type CSSProperty = Omit<keyof CSSStyleDeclaration, 'length' | 'parentRule'>;

// export type CSSValue<T extends keyof CSSStyleDeclaration> = string | number | undefined;
// export type CSSValue<T extends keyof CSSStyleDeclaration> = unknown; //typeof CSSStyleDeclaration[T];
export type CSSValue<T extends keyof CSSStyleDeclaration> = CSSStyleDeclaration[T];

export type CSSDeclaration = {
    [K in keyof CSSStyleDeclaration]?: NonNullable<CSSValue<K>>;
};

export type CSSClassName = string & { _CSSClassNameBrand: never };
// const isValidCSSClassName = (name: string): name is CSSClassName => /^[_a-zA-Z][_a-zA-Z0-9-]*$/.test(name);

/**
 * Just a friendly alias for CSSStyleDeclaration
 */
export type CSSObject = CSSDeclaration;
