self.addEventListener("install", (event) => {
  console.log("SW instalado");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW activado");
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Caché (más adelante)
});

self.addEventListener("push", (event) => {
  console.log("📩 Push recibida");

  if (!event.data) return;

  const data = event.data.json();

  console.log(data);

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icon-192.png",
      badge: data.badge || "/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("/")
  );
});