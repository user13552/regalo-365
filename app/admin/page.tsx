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
  const [tipoPush, setTipoPush] = useState<
  "inmediata" | "programada" | "diaria"
>("inmediata");
  const [tituloProgramado, setTituloProgramado] = useState("");
  const [pestana, setPestana] = useState<
  "dias" | "notificaciones" | "historial"
>("dias");
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

    let fechaHora: Date;

    if (tipoPush === "programada") {

      fechaHora = new Date(
        `${fechaProgramada}T${horaProgramada}:00`
      );

    } else {

      // Para las diarias usamos la fecha de hoy.
      // El cron solo tendrá en cuenta la hora.
      fechaHora = new Date();

      const [h, m] = horaProgramada.split(":");

      fechaHora.setHours(
        Number(h),
        Number(m),
        0,
        0
      );

    }

    const { error } = await supabase
      .from("notificaciones")
      .insert({

        titulo: tituloProgramado,

        mensaje: mensajeProgramado,

        fecha_envio: fechaHora.toISOString(),

        hora: horaProgramada,

        tipo:
          tipoPush === "diaria"
            ? "diaria"
            : "programada",

        activa: true,

        enviada: false,

        ultima_ejecucion: null,

      });

    if (error) {

      console.error(error);

      alert("❌ Error guardando la notificación");

      return;

    }

    alert("✅ Notificación guardada");

    setTituloProgramado("");

    setMensajeProgramado("");

    setFechaProgramada("");

    setHoraProgramada("12:00");

    setTipoPush("programada");

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

<div className="mb-8 flex gap-3">

  <button
    onClick={() => setPestana("dias")}
    className={`rounded-xl px-5 py-3 font-semibold transition
      ${
        pestana === "dias"
          ? "bg-violet-700 text-white"
          : "bg-white border border-gray-300 text-black hover:bg-gray-100"
      }`}
  >
    📅 Días
  </button>

  <button
    onClick={() => setPestana("notificaciones")}
    className={`rounded-xl px-5 py-3 font-semibold transition
      ${
        pestana === "notificaciones"
          ? "bg-violet-700 text-white"
          : "bg-white border border-gray-300 text-black hover:bg-gray-100"
      }`}
  >
    🔔 Notificaciones
  </button>

  <button
    onClick={() => setPestana("historial")}
    className={`rounded-xl px-5 py-3 font-semibold transition
      ${
        pestana === "historial"
          ? "bg-violet-700 text-white"
          : "bg-white border border-gray-300 text-black hover:bg-gray-100"
      }`}
  >
    📊 Historial
  </button>

</div>

{pestana === "notificaciones" && (
  <>

    <div className="rounded-3xl bg-white p-6 shadow-xl mt-8">

  <h2 className="text-2xl text-black font-bold mb-6">
    🔔 Nueva notificación
  </h2>

  {/* Tipo */}

  <label className="block text-black font-semibold mb-2">
    Tipo
  </label>

  <select
    value={tipoPush}
    onChange={(e) =>
      setTipoPush(
        e.target.value as
          | "inmediata"
          | "programada"
          | "diaria"
      )
    }
    className="w-full border rounded-xl p-3 text-black mb-5"
  >
    <option value="inmediata">
      🚀 Enviar ahora
    </option>

    <option value="programada">
      📅 Programar
    </option>

    <option value="diaria">
      🔁 Todos los días
    </option>

  </select>


  {/* Título */}

  <label className="block text-black font-semibold mb-2">
    Título
  </label>

  <input
    value={tituloPush}
    onChange={(e) => setTituloPush(e.target.value)}
    placeholder="Título"
    className="w-full border rounded-xl p-3 text-black mb-4"
  />


  {/* Mensaje */}

  <label className="block text-black font-semibold mb-2">
    Mensaje
  </label>

  <textarea
    value={mensajePush}
    onChange={(e) => setMensajePush(e.target.value)}
    placeholder="Mensaje"
    className="w-full border rounded-xl p-3 text-black h-32 mb-4"
  />


  {/* Fecha */}

  {tipoPush === "programada" && (

    <>

      <label className="block text-black font-semibold mb-2">
        Fecha
      </label>

      <input
        type="date"
        value={fechaProgramada}
        onChange={(e) =>
          setFechaProgramada(e.target.value)
        }
        className="w-full border rounded-xl p-3 text-black mb-4"
      />

    </>

  )}


  {/* Hora */}

  {(tipoPush === "programada" ||
    tipoPush === "diaria") && (

    <>

      <label className="block text-black font-semibold mb-2">
        Hora
      </label>

      <input
        type="time"
        value={horaProgramada}
        onChange={(e) =>
          setHoraProgramada(e.target.value)
        }
        className="w-full border rounded-xl p-3 text-black mb-5"
      />

    </>

  )}


  {/* Botón */}

  <button

    onClick={() => {

      if (tipoPush === "inmediata") {

        enviarPush();

      } else {

        programarPush();

      }

    }}

    disabled={enviandoPush}

    className="rounded-xl bg-violet-700 px-6 py-3 text-white font-semibold hover:bg-violet-800 transition"

  >

    {tipoPush === "inmediata"
      ? "🚀 Enviar ahora"
      : "💾 Guardar notificación"}

  </button>

</div>

  </>
)}

{pestana === "dias" && (
  <>

  <Link
  href="/admin/nuevo"
  className="inline-block bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition"
>
  + Nuevo día
</Link>

  <div className="bg-white rounded-2xl shadow mt-6">

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

  </>
)}

</main>
    </main>
  );
}