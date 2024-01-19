declare global {
  interface Window {
    [key:string]: any; // Add index signature
  }
}

export {};
