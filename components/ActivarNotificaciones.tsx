"use client";

export default function ActivarNotificaciones() {
  async function activar() {
    if (!("Notification" in window)) {
      alert("Este navegador no admite notificaciones.");
      return;
    }

    const permiso = await Notification.requestPermission();

    if (permiso !== "granted") {
      alert("No se concedieron permisos.");
      return;
    }

    alert("¡Permisos concedidos!");
  }

  return (
    <button
      onClick={activar}
      className="bg-pink-600 text-white px-4 py-2 rounded-xl"
    >
      🔔 Activar notificaciones
    </button>
  );
}