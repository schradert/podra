/* eslint-disable-next-line @typescript-eslint/triple-slash-reference */
/// <reference types="chrome" />

// JS cannot import as 'virtual:pwa-register/react' when running jest tests
// how do I get the service worker to work?!
declare module "vite-plugin-pwa/dist/client/dev/react.mjs" {
  export * from "virtual:pwa-register/react";
}
