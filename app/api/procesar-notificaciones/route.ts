import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

  let enviadas = 0;
  let eliminadas = 0;
  let errores = 0;

  for (const notificacion of notificaciones) {

    // ===============================
    // PROGRAMADAS
    // ===============================

    if (notificacion.tipo === "programada") {

      if (notificacion.enviada) continue;

      const fecha = new Date(notificacion.fecha_envio);

      if (fecha > ahora) continue;

    }

    // ===============================
    // DIARIAS
    // ===============================

    if (notificacion.tipo === "diaria") {

      const [hora, minuto] = notificacion.hora
        .split(":")
        .map(Number);

      const programada = new Date(ahora);

      programada.setHours(hora);
      programada.setMinutes(minuto);
      programada.setSeconds(0);
      programada.setMilliseconds(0);

      const diferencia =
        ahora.getTime() - programada.getTime();

      // Todavía no es la hora
      if (diferencia < 0) continue;

      // Ya pasaron más de 5 minutos
      if (diferencia > 5 * 60 * 1000) continue;

      // Ya se envió hoy
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

    // ===============================
    // ENVÍO
    // ===============================

    try {

      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: notificacion.titulo,
            body: notificacion.mensaje,
          }),
        }
      );

      const resultado = await respuesta.json();

      console.log(resultado);

      if (!respuesta.ok || !resultado.success) {

        errores++;

        continue;

      }

      enviadas += resultado.enviadas ?? 0;
      eliminadas += resultado.eliminadas ?? 0;
      errores += resultado.errores ?? 0;

      // ===============================
      // ACTUALIZAR ESTADO
      // ===============================

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
            ultima_ejecucion:
              ahora.toISOString(),
          })
          .eq("id", notificacion.id);

      }

    } catch (e) {

      console.error(e);

      errores++;

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