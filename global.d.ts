declare global {
  interface Window {
    [key:string]: any; // Add index signature
  }

  interface ProxyConstructor {
      new <TSource extends object, TTarget extends object>(target: TSource, handler: ProxyHandler<TSource>): TTarget;
  }
}

export {};
