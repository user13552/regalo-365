"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useMemo} from "react";
import Link from "next/link";
import FormularioDia, {
  DatosFormularioDia,
} from "@/components/FormularioDia";
import { subirFotos } from "@/lib/storage";


export default function AdminPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [autorizada, setAutorizada] = useState(false);
  const [dias, setDias] = useState<any[]>([]);
  const [fotosSeleccionadas, setFotosSeleccionadas] = useState<File[]>([]);
  const [tituloPush, setTituloPush] = useState("");
  const [mensajePush, setMensajePush] = useState("");
  const [enviandoPush, setEnviandoPush] = useState(false);
  const [tituloProgramado, setTituloProgramado] = useState("");
  const [mensajeProgramado, setMensajeProgramado] = useState("");
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [horaProgramada, setHoraProgramada] = useState("12:00");

  const previews = useMemo(() => {
  return fotosSeleccionadas.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));
}, [fotosSeleccionadas]);

async function programarPush() {
  try {

    const fechaHora = new Date(
      `${fechaProgramada}T${horaProgramada}:00`
    );

    const { error } = await supabase
      .from("notificaciones")
      .insert({
        titulo: tituloProgramado,
        mensaje: mensajeProgramado,
        fecha_envio: fechaHora.toISOString(),
        tipo: "programada",
      });

    if (error) {
      console.error(error);
      alert("Error programando la notificación");
      return;
    }

    alert("✅ Notificación programada");

    setTituloProgramado("");
    setMensajeProgramado("");
    setFechaProgramada("");
    setHoraProgramada("12:00");

  } catch (e) {
    console.error(e);
  }
}

async function enviarPush() {
  setEnviandoPush(true);

  try {
    const { error } = await supabase
      .from("notificaciones")
      .insert({
        titulo: tituloPush,
        mensaje: mensajePush,
        fecha_envio: new Date().toISOString(),
        tipo: "inmediata",
      });

    console.log("ERROR INSERT:", error);

    if (!error) {

  await fetch("/api/procesar-notificaciones", {
    method: "POST",
  });

  alert("✅ Notificación enviada");

  setTituloPush("");
  setMensajePush("");

}

  } catch (e) {
    console.error("ERROR GENERAL:", e);
  }

  setEnviandoPush(false);
}



  useEffect(() => {
    async function comprobarUsuario() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
  router.replace("/");
  return;
}



const email = session.user.email.toLowerCase();


const {
  data: admin,
  error: errorAdmin,
} = await supabase
  .from("admins")
  .select("email")
  .eq("email", email)
  .maybeSingle();

if (errorAdmin) {
  console.error("Error comprobando administrador:", errorAdmin);
  router.replace("/");
  return;
}

if (!admin) {
  router.replace("/");
  return;
}
      const { data } = await supabase
        .from("dias")
        .select("id, dia, fecha")
        .order("fecha");

        setDias(data ?? []);

      setAutorizada(true);
      setCargando(false);
    }



    comprobarUsuario();
  }, [router]);

  if (cargando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Comprobando acceso...</p>
      </main>
    );
  }

  if (!autorizada) {
    return null;
  }

  

  return (
    <main className="min-h-screen flex items-center justify-center">
      <main className="min-h-screen bg-gray-100 p-10">

  <h1 className="text-4xl font-bold text-black mb-8">
    Panel de administración
  </h1>

  <button
  onClick={() => router.push("/")}
  className="absolute top-5 left-5 bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 rounded-xl shadow-lg transition"
>
  ← Volver
</button>

<div className="rounded-3xl bg-white p-6 shadow-xl mt-8">
  <h2 className="text-2xl text-black font-bold mb-4">
    🔔 Notificaciones Push
  </h2>

  <input
    value={tituloPush}
    onChange={(e) => setTituloPush(e.target.value)}
    placeholder="Título"
    className="w-full border text-black rounded-xl p-3 mb-3"
  />

  <textarea
    value={mensajePush}
    onChange={(e) => setMensajePush(e.target.value)}
    placeholder="Mensaje"
    className="w-full border text-black rounded-xl p-3 mb-4 h-32"
  />

  <button
    onClick={enviarPush}
    disabled={enviandoPush}
    className="px-6 py-3 text-black rounded-xl bg-pink-600 text-white"
  >
    {enviandoPush ? "Enviando..." : "Enviar notificación"}
  </button>
</div>

<div className="rounded-3xl bg-white p-6 shadow-xl mt-8">

  <h2 className="text-2xl  text-black font-bold mb-5">
    📅 Programar notificación
  </h2>

  <input
    value={tituloProgramado}
    onChange={(e) =>
      setTituloProgramado(e.target.value)
    }
    placeholder="Título"
    className="w-full border text-black rounded-xl p-3 mb-3"
  />

  <textarea
    value={mensajeProgramado}
    onChange={(e) =>
      setMensajeProgramado(e.target.value)
    }
    placeholder="Mensaje"
    className="w-full border text-black rounded-xl p-3 mb-3 h-32"
  />

  <input
    type="date"
    value={fechaProgramada}
    onChange={(e) =>
      setFechaProgramada(e.target.value)
    }
    className="w-full border text-black rounded-xl p-3 mb-3"
  />

  <input
    type="time"
    value={horaProgramada}
    onChange={(e) =>
      setHoraProgramada(e.target.value)
    }
    className="w-full border text-black rounded-xl p-3 mb-4"
  />

  <button
    onClick={programarPush}
    className="rounded-xl bg-green-600 text-black px-6 py-3 text-white font-semibold hover:bg-green-700"
  >
    📅 Programar
  </button>

</div>

<button
  onClick={async () => {
    console.log("🔘 Botón pulsado");

    const r = await fetch("/api/procesar-notificaciones", {
      method: "POST",
    });

    console.log("Status:", r.status);

    const json = await r.json();

    console.log(json);

    alert("Proceso terminado");
  }}
  className="mt-4 rounded-xl border-2 border-blue-600 bg-white px-6 py-3 font-semibold text-blue-600"
>
  🔄 Procesar notificaciones
</button>

  <Link
  href="/admin/nuevo"
  className="inline-block bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition"
>
  + Nuevo día
</Link>

  <div className="bg-white rounded-2xl shadow">

    {dias.map((dia) => (

      <div
        key={dia.id}
        className="flex justify-between items-center p-4 border-b"
      >

        <div>

          <div className="text-black font-semibold">
            Día {dia.dia}
          </div>

          <div className="text-black text-sm">
            {dia.fecha}
          </div>

        </div>

        <button
            type="button"
            onClick={() => router.push(`/admin/editar/${dia.id}`)}
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
        >           
            Editar ✏️
        </button>

      </div>

    ))}

  </div>

</main>
    </main>
  );
}