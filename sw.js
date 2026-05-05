// Thalia Perfumaria — Service Worker v1
const CACHE_NAME = "thalia-portal-v1";

// Instala o SW
self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

// Recebe push do servidor (futuro)
self.addEventListener("push", e => {
  let data = { title: "Thalia Perfumaria", body: "Novo informativo publicado.", icon: "/icon-192.png" };
  try { data = e.data.json(); } catch(err) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      tag: "thalia-info",
      renotify: true,
      data: { url: data.url || "/" }
    })
  );
});

// Clique na notificação abre o portal
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(e.notification.data.url || "/");
    })
  );
});

// Mensagem do portal → dispara notificação local
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SHOW_NOTIFICATION") {
    const { title, body } = e.data;
    self.registration.showNotification(title, {
      body: body || "Novo informativo na rede Thalia.",
      icon: e.data.icon || "",
      badge: e.data.icon || "",
      vibrate: [200, 100, 200],
      tag: "thalia-info-" + Date.now(),
      renotify: true,
      data: { url: self.registration.scope }
    });
  }
});
