"use client";

import UploadZone from "@/components/UploadZone";

export type DatosFormularioDia = {
  fecha: string;
  cancion: string;
  enlace: string;
  mensaje: string;
  aviso: string;
  videoRegalo: string;
  textoVideoRegalo: string;
  enlaceExtra: string;
  textoEspecialTitulo: string;
  textoEspecial: string;
};

type FotoExistente = {
  ruta: string;
  url: string;
};

type FotoPreview = {
  file: File;
  url: string;
};

type Props = {
  datos: DatosFormularioDia;
  onCambiar: (
    campo: keyof DatosFormularioDia,
    valor: string
  ) => void;

  fotosExistentes?: FotoExistente[];
  eliminarFotoExistente?: (ruta: string) => void;

  fotosSeleccionadas: File[];
  setFotosSeleccionadas: React.Dispatch<
    React.SetStateAction<File[]>
  >;
  videoSeleccionado: File | null;

    setVideoSeleccionado: React.Dispatch<
  React.SetStateAction<File | null>
  >;

  previews: FotoPreview[];
  onEliminarFoto: (indice: number) => void;

  guardando: boolean;
  textoBoton?: string;
};

export default function FormularioDia({
  datos,
  onCambiar,
  setFotosSeleccionadas,
  previews,
  onEliminarFoto,
  videoSeleccionado,
  eliminarFotoExistente,
  setVideoSeleccionado,
  fotosExistentes = [],
  guardando,
  textoBoton = "Guardar día",
}: Props) {
  function añadirFotos(nuevasFotos: File[]) {
    setFotosSeleccionadas((anteriores) => {
      const todas = [...anteriores, ...nuevasFotos];

      return todas.filter(
        (foto, indice, array) =>
          indice ===
          array.findIndex(
            (otra) =>
              otra.name === foto.name &&
              otra.size === foto.size &&
              otra.lastModified === foto.lastModified
          )
      );
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-black font-medium">
          Fecha
        </label>

        <input
          type="date"
          value={datos.fecha}
          onChange={(e) =>
            onCambiar("fecha", e.target.value)
          }
          required
          className="w-full text-black rounded-xl border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-black font-medium">
          Canción
        </label>

        <input
          type="text"
          value={datos.cancion}
          onChange={(e) =>
            onCambiar("cancion", e.target.value)
          }
          className="w-full text-black rounded-xl border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-black font-medium">
          Enlace de la canción
        </label>

        <input
          type="url"
          value={datos.enlace}
          onChange={(e) =>
            onCambiar("enlace", e.target.value)
          }
          placeholder="https://..."
          className="w-full text-black rounded-xl border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-black font-medium">
          Mensaje
        </label>

        <textarea
          value={datos.mensaje}
          onChange={(e) =>
            onCambiar("mensaje", e.target.value)
          }
          rows={5}
          className="w-full text-black rounded-xl border p-3"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg text-black font-semibold">
          Contenido opcional
        </h2>

        <div>
          <label className="mb-1 block text-black font-medium">
            Aviso
          </label>

          <input
            type="text"
            value={datos.aviso}
            onChange={(e) =>
              onCambiar("aviso", e.target.value)
            }
            placeholder="Hoy hay una sorpresa especial"
            className="w-full text-black rounded-xl border p-3"
          />
        </div>

        <div className="space-y-3">
  <label className="block text-black font-semibold">
    Vídeo regalo (opcional)
  </label>

  <UploadZone
    accept="video/*"
    multiple={false}
    titulo="Seleccionar vídeo regalo"
    descripcion="Haz clic para elegir un vídeo"
    icono="🎬"
    onFilesSelected={(files) => {
      if (files.length > 0) {
        setVideoSeleccionado(files[0]);
      }
    }}
  />

  {videoSeleccionado && (
  <div className="relative rounded-xl bg-gray-100 p-4 text-black shadow">
    <button
      type="button"
      onClick={() => setVideoSeleccionado(null)}
      className="absolute right-2 top-2 h-8 w-8 rounded-full bg-red-600 text-white font-bold shadow hover:bg-red-700 transition"
      aria-label="Eliminar vídeo"
    >
      ×
    </button>

    <div className="pr-10">
      <div className="font-semibold">
        🎬 Vídeo seleccionado
      </div>

      <div className="mt-1 text-gray-700 break-all">
        {videoSeleccionado.name}
      </div>
    </div>
  </div>
)}
</div>

        <div>
          <label className="mb-1 text-black block font-medium">
            Texto del botón de vídeo
          </label>

          <input
            type="text"
            value={datos.textoVideoRegalo}
            onChange={(e) =>
              onCambiar(
                "textoVideoRegalo",
                e.target.value
              )
            }
            placeholder="Ver regalo"
            className="w-full text-black rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-1 text-black block font-medium">
            Enlace extra
          </label>

          <input
            type="url"
            value={datos.enlaceExtra}
            onChange={(e) =>
              onCambiar("enlaceExtra", e.target.value)
            }
            placeholder="https://..."
            className="w-full text-black rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-1 text-black block font-medium">
            Título del texto especial
          </label>

          <input
            type="text"
            value={datos.textoEspecialTitulo}
            onChange={(e) =>
              onCambiar(
                "textoEspecialTitulo",
                e.target.value
              )
            }
            className="w-full text-black rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-1 text-black block font-medium">
            Texto especial
          </label>

          <textarea
            value={datos.textoEspecial}
            onChange={(e) =>
              onCambiar("textoEspecial", e.target.value)
            }
            rows={5}
            className="w-full text-black rounded-xl border p-3"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-black font-semibold">
          Fotografías
        </label>

        <UploadZone onFilesSelected={añadirFotos} />
      </div>

      {fotosExistentes.length > 0 && (
  <div>
    <p className="mb-3 font-semibold text-black">
      Fotografías guardadas
    </p>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {fotosExistentes.map((foto) => (
  <div
    key={foto.ruta}
    className="relative overflow-hidden rounded-2xl shadow"
  >
    <img
      src={foto.url}
      alt="Fotografía guardada"
      className="h-48 w-full object-cover"
    />

    <button
      type="button"
      onClick={() => eliminarFotoExistente?.(foto.ruta)}
      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700"
      title="Eliminar fotografía"
    >
      ✕
    </button>
  </div>
))}
    </div>
  </div>
)}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {previews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${index}`}
              className="relative overflow-hidden rounded-2xl shadow"
            >
              <button
                type="button"
                onClick={() => onEliminarFoto(index)}
                className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-red-600 font-bold text-white shadow-lg transition hover:bg-red-700"
                aria-label={`Quitar ${preview.file.name}`}
              >
                ×
              </button>

              <img
                src={preview.url}
                alt={`Vista previa de ${preview.file.name}`}
                className="h-48 text-black w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {guardando ? "Guardando..." : textoBoton}
      </button>
    </div>
  );
}