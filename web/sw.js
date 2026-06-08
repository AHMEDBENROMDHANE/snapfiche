// Service worker minimal SnapFiche : rend l'app installable (PWA) sans cacher
// l'app de façon agressive (on veut toujours la dernière version). Passe-plat réseau.
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());
self.addEventListener('fetch', (e) => {
  // Réseau direct (pas de cache) -> pas de version périmée. Offline non géré (app en ligne).
});
