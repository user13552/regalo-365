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

  const previews = useMemo(() => {
  return fotosSeleccionadas.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));
}, [fotosSeleccionadas]);

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