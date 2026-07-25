self.addEventListener("install", (event) => {
  console.log("SW instalado");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW activado");
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Más adelante añadiremos la caché aquí.
});