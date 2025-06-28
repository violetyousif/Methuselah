// global.d.ts

// LESS module declarations
declare module '*.less' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// LESS module declarations for CSS Modules
declare module '*.module.less' {
  const classes: { [key: string]: string }
  export default classes
}


// Add the global Window.ethereum definition
declare global {
  interface Window {
    ethereum?: any
  }
}

export {}  // Ensure this file is a module, so the `declare global` doesn't pollute the global scope accidentally.
