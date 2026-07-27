import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  "mailto:celia@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(request: Request) {

  const secret = request.headers.get("x-cron-secret");

  if (secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  return POST();
}

export async function POST() {

  console.log("🔔 Procesando notificaciones...");

  // Buscar las notificaciones pendientes
  const { data: notificaciones, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("enviada", false)
    .lte("fecha_envio", new Date().toISOString());

  if (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }

  if (!notificaciones || notificaciones.length === 0) {

    return NextResponse.json({
      success: true,
      mensaje: "No hay notificaciones pendientes",
    });

  }

  // Obtener todas las PushSubscription
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (!subs || subs.length === 0) {

    return NextResponse.json({
      success: false,
      mensaje: "No hay dispositivos registrados",
    });

  }

  // Enviar todas las notificaciones pendientes
  for (const notificacion of notificaciones) {

    for (const sub of subs) {

      try {

        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: notificacion.titulo,
            body: notificacion.mensaje,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          })
        );

      } catch (e) {

        console.error(e);

      }

    }

    // Marcar enviada
    await supabase
      .from("notificaciones")
      .update({
        enviada: true,
      })
      .eq("id", notificacion.id);

  }

  return NextResponse.json({
    success: true,
  });

}
