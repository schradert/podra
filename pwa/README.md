# Existing Errors

## `yarn dev/build/storybook`

```
node_modules/firebase-admin/node_modules/@firebase/database/dist/index.esm.js:1:7: error: No matching export in "node_modules/@firebase/app/dist/index.esm2017.js" for import "default"
```

```js
import firebase from "@firebase/app";
```

## `yarn test`

Importing the service worker module during tests does not work because it imports them conditionally through vite and npm command. Probably best to just use workbox directly.
