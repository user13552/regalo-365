import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  "mailto:celia.rm42@gmail.com",
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

  const ahora = new Date();

  const { data: notificaciones, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("activa", true);

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

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (!subs || subs.length === 0) {

    return NextResponse.json({
      success: false,
      mensaje: "No hay dispositivos registrados",
    });

  }

  let enviadas = 0;
  let eliminadas = 0;
  let errores = 0;

  for (const notificacion of notificaciones) {

    // -----------------------------
    // PROGRAMADAS
    // -----------------------------

    if (notificacion.tipo === "programada") {

      if (notificacion.enviada) continue;

      const fecha = new Date(notificacion.fecha_envio);

      if (fecha > ahora) continue;

    }

    // -----------------------------
    // DIARIAS
    // -----------------------------

    if (notificacion.tipo === "diaria") {

      const [hora, minuto] = notificacion.hora
  .split(":")
  .map(Number);

// Hora programada para hoy
const programada = new Date(ahora);

programada.setHours(hora);
programada.setMinutes(minuto);
programada.setSeconds(0);
programada.setMilliseconds(0);

// Diferencia en milisegundos
const diferencia =
  ahora.getTime() - programada.getTime();

// Si todavía no ha llegado la hora
if (diferencia < 0) {
  continue;
}

// Si han pasado más de 5 minutos
if (diferencia > 5 * 60 * 1000) {
  continue;
}

// Si ya se envió hoy
if (notificacion.ultima_ejecucion) {

  const ultima = new Date(
    notificacion.ultima_ejecucion
  );

  if (
    ultima.toDateString() ===
    ahora.toDateString()
  ) {
    continue;
  }

}

    }

    // -----------------------------
    // ENVÍO
    // -----------------------------

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

        enviadas++;

      } catch (e: any) {

        errores++;

        console.error(e);

        if (
          e.statusCode === 404 ||
          e.statusCode === 410
        ) {

          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);

          eliminadas++;

          console.log("🗑 Suscripción eliminada");

        }

      }

    }

    // -----------------------------
    // ACTUALIZAR BD
    // -----------------------------

    if (notificacion.tipo === "programada") {

      await supabase
        .from("notificaciones")
        .update({
          enviada: true,
        })
        .eq("id", notificacion.id);

    }

    if (notificacion.tipo === "diaria") {

      await supabase
        .from("notificaciones")
        .update({
          ultima_ejecucion: ahora.toISOString(),
        })
        .eq("id", notificacion.id);

    }

  }

  console.log("📊 Resumen");
  console.log("Enviadas:", enviadas);
  console.log("Eliminadas:", eliminadas);
  console.log("Errores:", errores);

  return NextResponse.json({
    success: true,
    enviadas,
    eliminadas,
    errores,
  });

}