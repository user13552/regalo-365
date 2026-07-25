"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect} from "react";
import { subirFotos } from "@/lib/storage";
import FormularioDia, {
  DatosFormularioDia,
} from "@/components/FormularioDia";

type FotoPreview = {
  file: File;
  url: string;
};

export default function NuevoDiaPage() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [fotosSeleccionadas, setFotosSeleccionadas] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FotoPreview[]>([]);
  
  const [videoSeleccionado, setVideoSeleccionado] =
  useState<File | null>(null);

  const [datos, setDatos] = useState<DatosFormularioDia>({
  fecha: "",
  cancion: "",
  enlace: "",
  mensaje: "",
  aviso: "",
  videoRegalo: "",
  textoVideoRegalo: "",
  enlaceExtra: "",
  textoEspecialTitulo: "",
  textoEspecial: "",
});
  useEffect(() => {
  const nuevasPreviews = fotosSeleccionadas.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));

  setPreviews(nuevasPreviews);

  return () => {
    nuevasPreviews.forEach((preview) => {
      URL.revokeObjectURL(preview.url);
    });
  };
}, [fotosSeleccionadas]);

function cambiarCampo(
  campo: keyof DatosFormularioDia,
  valor: string
) {
  setDatos((anteriores) => ({
    ...anteriores,
    [campo]: valor,
  }));
}

function eliminarFoto(indice: number) {
  setFotosSeleccionadas((anteriores) =>
    anteriores.filter((_, i) => i !== indice)
  );
}

function formatearDia(fechaISO: string) {
  if (!fechaISO) return "";

  const [anio, mes, dia] = fechaISO.split("-");

  return `${Number(dia)}-${Number(mes)}-${anio}`;
}

  async function guardarDia(e: React.FormEvent) {
  e.preventDefault();
  const {
  fecha,
  cancion,
  enlace,
  mensaje,
  aviso,
  videoRegalo,
  textoVideoRegalo,
  enlaceExtra,
  textoEspecialTitulo,
  textoEspecial,
} = datos;

  setGuardando(true);
  setError("");

  try {
    const diaFormateado = formatearDia(fecha);

    const {
      data: diaCreado,
      error: errorInsert,
    } = await supabase
      .from("dias")
      .insert({
        fecha,
        dia: diaFormateado,
        cancion,
        enlace,
        mensaje,
        fotos: [],
        aviso: aviso || null,
        video_regalo: videoRegalo || null,
        texto_video_regalo: textoVideoRegalo || null,
        enlace_extra: enlaceExtra || null,
        texto_especial_titulo: textoEspecialTitulo || null,
        texto_especial: textoEspecial || null,
      })
      .select("id")
      .single();

    if (errorInsert) {
      throw errorInsert;
    }

    const rutas = await subirFotos(
      fotosSeleccionadas,
      diaCreado.id
    );

    const { error: errorUpdate } = await supabase
      .from("dias")
      .update({
        fotos: rutas,
      })
      .eq("id", diaCreado.id);

    if (errorUpdate) {
      throw errorUpdate;
    }

    router.push("/admin");
  } catch (error) {
    console.error("Error guardando el día:", error);

    if (error instanceof Error) {
      setError(`No se ha podido guardar: ${error.message}`);
    } else {
      setError("No se ha podido guardar el día.");
    }
  } finally {
    setGuardando(false);
  }
}

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-6 text-gray-700 hover:text-black"
        >
          ← Volver al panel
        </button>

        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10">
          <h1 className="text-3xl font-bold text-black mb-8">
            Nuevo día
          </h1>

          <form onSubmit={guardarDia}>
            {error && (
  <p className="mb-4 rounded-xl bg-red-100 p-3 text-red-700">
    {error}
  </p>
)}
  <FormularioDia
  datos={datos}
  onCambiar={cambiarCampo}
  fotosSeleccionadas={fotosSeleccionadas}
  setFotosSeleccionadas={setFotosSeleccionadas}
  previews={previews}
  onEliminarFoto={eliminarFoto}
  videoSeleccionado={videoSeleccionado}
  setVideoSeleccionado={setVideoSeleccionado}
  guardando={guardando}
  textoBoton="Guardar día"
/>
</form>
        </div>
      </div>
    </main>
  );
}