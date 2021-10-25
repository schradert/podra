import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

cleanupOutdatedCaches();

declare let self: ServiceWorkerGlobalScope;

self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// at the default injection point
precacheAndRoute(self.__WB_MANIFEST);
