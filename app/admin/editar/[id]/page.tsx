"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import FormularioDia, {
  DatosFormularioDia,
} from "@/components/FormularioDia";

type FotoPreview = {
  file: File;
  url: string;
};

type FotoExistente = {
  ruta: string;
  url: string;
};

const datosVacios: DatosFormularioDia = {
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
};

export default function EditarDiaPage() {
  const router = useRouter();
  const params = useParams();
  const [fotosEliminadas, setFotosEliminadas] = useState<string[]>([]);
  const [fotosExistentes, setFotosExistentes] =
  useState<FotoExistente[]>([]);

  const id = Number(params.id);

  const [datos, setDatos] =
    useState<DatosFormularioDia>(datosVacios);

  const [fotosSeleccionadas, setFotosSeleccionadas] =
    useState<File[]>([]);

  const [previews, setPreviews] =
    useState<FotoPreview[]>([]);

  const [videoSeleccionado, setVideoSeleccionado] =
    useState<File | null>(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDia() {
      if (!Number.isInteger(id)) {
        setError("El identificador del día no es válido.");
        setCargando(false);
        return;
      }

      const { data, error: errorCarga } = await supabase
        .from("dias")
        .select(`
          id,
          fecha,
          cancion,
          enlace,
          mensaje,
          aviso,
          video_regalo,
          texto_video_regalo,
          enlace_extra,
          texto_especial_titulo,
          texto_especial,
          fotos
        `)
        .eq("id", id)
        .single();

      if (errorCarga) {
        console.error(errorCarga);
        setError("No se ha podido cargar el día.");
        setCargando(false);
        return;
      }

      

      setDatos({
        fecha: data.fecha ?? "",
        cancion: data.cancion ?? "",
        enlace: data.enlace ?? "",
        mensaje: data.mensaje ?? "",
        aviso: data.aviso ?? "",
        videoRegalo: data.video_regalo ?? "",
        textoVideoRegalo: data.texto_video_regalo ?? "",
        enlaceExtra: data.enlace_extra ?? "",
        textoEspecialTitulo:
          data.texto_especial_titulo ?? "",
        textoEspecial: data.texto_especial ?? "",
      });

      const rutasFotos: string[] = Array.isArray(data.fotos)
  ? data.fotos
  : [];


if (rutasFotos.length > 0) {
  const {
    data: urlsFirmadas,
    error: errorFotos,
  } = await supabase.storage
    .from("recuerdos")
    .createSignedUrls(rutasFotos, 3600);


  if (errorFotos) {
    console.error(
      "Error cargando las fotografías:",
      errorFotos
    );
  } else {
  const fotosValidas: FotoExistente[] = urlsFirmadas
    .map((foto, indice) => ({
      ruta: rutasFotos[indice],
      url: foto.signedUrl,
    }))
    .filter(
      (foto): foto is FotoExistente =>
        typeof foto.ruta === "string" &&
        typeof foto.url === "string"
    );

  setFotosExistentes(fotosValidas);
}
}

      

      setCargando(false);
    }

    cargarDia();
  }, [id]);

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

  function eliminarFotoExistente(ruta: string) {
  setFotosExistentes((anteriores) =>
    anteriores.filter((foto) => foto.ruta !== ruta)
  );

  setFotosEliminadas((anteriores) => [...anteriores, ruta]);
}

  function eliminarFoto(indice: number) {
    setFotosSeleccionadas((anteriores) =>
      anteriores.filter((_, i) => i !== indice)
    );
  }

  async function guardarCambios(e: React.FormEvent) {
  e.preventDefault();

  setGuardando(true);
  setError("");

  try {
    // 1. Eliminar de Storage las fotografías marcadas
    if (fotosEliminadas.length > 0) {
      const { error: errorEliminarFotos } =
        await supabase.storage
          .from("recuerdos")
          .remove(fotosEliminadas);

      if (errorEliminarFotos) {
        throw errorEliminarFotos;
      }
    }

    // 2. Empezar con las fotografías antiguas que se conservan
    const rutasFotosActualizadas = fotosExistentes.map(
      (foto) => foto.ruta
    );

    // 3. Subir las fotografías nuevas seleccionadas
    for (const foto of fotosSeleccionadas) {
      const rutaFoto = `fotos/${id}/${foto.name}`;

      const { error: errorSubida } = await supabase.storage
        .from("recuerdos")
        .upload(rutaFoto, foto, {
          cacheControl: "3600",
          upsert: true,
        });

      if (errorSubida) {
        throw errorSubida;
      }

      rutasFotosActualizadas.push(rutaFoto);
    }

    // 4. Actualizar el día y guardar todas las rutas
    const { error: errorUpdate } = await supabase
      .from("dias")
      .update({
        fecha: datos.fecha,
        cancion: datos.cancion || null,
        enlace: datos.enlace || null,
        mensaje: datos.mensaje || null,

        fotos: rutasFotosActualizadas,

        aviso: datos.aviso || null,
        texto_video_regalo:
          datos.textoVideoRegalo || null,
        enlace_extra: datos.enlaceExtra || null,
        texto_especial_titulo:
          datos.textoEspecialTitulo || null,
        texto_especial: datos.textoEspecial || null,
      })
      .eq("id", id);

    if (errorUpdate) {
      throw errorUpdate;
    }

    router.push("/admin");
  } catch (errorDesconocido) {
    console.error(errorDesconocido);

    if (errorDesconocido instanceof Error) {
      setError(errorDesconocido.message);
    } else {
      setError("No se han podido guardar los cambios.");
    }
  } finally {
    setGuardando(false);
  }
}

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 text-black">
        Cargando día...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black md:p-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-6 text-gray-700 hover:text-black"
        >
          ← Volver al panel
        </button>

        <div className="rounded-3xl bg-white p-6 shadow-lg md:p-10">
          <h1 className="mb-8 text-3xl font-bold">
            Editar día
          </h1>

          {error && (
            <p className="mb-4 rounded-xl bg-red-100 p-3 text-red-700">
              {error}
            </p>
          )}

          <form onSubmit={guardarCambios}>
            <FormularioDia
              datos={datos}
              eliminarFotoExistente={eliminarFotoExistente}
              onCambiar={cambiarCampo}
              fotosSeleccionadas={fotosSeleccionadas}
              setFotosSeleccionadas={setFotosSeleccionadas}
              previews={previews}
              onEliminarFoto={eliminarFoto}
              videoSeleccionado={videoSeleccionado}
              setVideoSeleccionado={setVideoSeleccionado}
              guardando={guardando}
              fotosExistentes={fotosExistentes}
              textoBoton="Guardar cambios"
            />
          </form>
        </div>
      </div>
    </main>
  );
}