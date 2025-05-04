declare module '*.less' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module 'markdown-it-katex'
// global.d.ts

// 1. LESS module declarations
declare module '*.less' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.less' {
  const classes: { [key: string]: string }
  export default classes
}

// 2. For markdown-it-katex, if you still need it
declare module 'markdown-it-katex'

// 3. Add the global Window.ethereum definition
export {}  // Ensure this file is a module, so the `declare global` doesn't pollute the global scope accidentally.
declare global {
  interface Window {
    ethereum?: any
  }
}
