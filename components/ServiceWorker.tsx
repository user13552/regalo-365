"use client";

import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
     console.log("🚀 ServiceWorker component montado");
    if (!("serviceWorker" in navigator)) return;

    async function register() {
      try {
        const registration =
          await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope: "/",
              updateViaCache: "none",
            }
          );

        console.log(
          "✅ Service Worker registrado",
          registration
        );
      } catch (err) {
        console.error(
          "❌ Error registrando SW",
          err
        );
      }
    }

    register();
  }, []);

  return null;
}