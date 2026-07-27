import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log("🔥 route cargada");

webpush.setVapidDetails(
  "mailto:celia.rm42@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {

  console.log("🔥 API ejecutada");

  const { title, body } = await request.json();

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (error || !data || data.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "No hay suscripciones",
      },
      { status: 404 }
    );
  }

  // Enviar la notificación a todas las suscripciones
  for (const sub of data) {

    const subscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    console.log("📨 Enviando a:", sub.usuario);

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      })
    );
  }

  console.log("✅ Notificación enviada");

  return NextResponse.json({
    success: true,
  });

}