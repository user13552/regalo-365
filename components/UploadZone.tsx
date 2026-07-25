"use client";

import { useRef } from "react";

type Props = {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  titulo?: string;
  descripcion?: string;
  icono?: string;
};

export default function UploadZone({
  onFilesSelected,
  accept = "image/*",
  multiple = true,
  titulo = "Seleccionar fotografías",
  descripcion = "Haz clic para elegir varias imágenes",
  icono = "📷",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function seleccionarArchivos(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files) return;

    onFilesSelected(Array.from(e.target.files));

    // Permite volver a seleccionar el mismo archivo.
    e.target.value = "";
  }

  function abrirSelector() {
    inputRef.current?.click();
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={seleccionarArchivos}
      />

      <div
        onClick={abrirSelector}
        className="
          cursor-pointer
          rounded-3xl
          border-2
          border-dashed
          border-gray-400
          p-10
          text-center
          text-black
          transition
          hover:border-black
          hover:bg-gray-50
        "
      >
        <div className="mb-4 text-6xl">
          {icono}
        </div>

        <div className="text-lg font-semibold">
          {titulo}
        </div>

        <div className="mt-2 text-gray-500">
          {descripcion}
        </div>
      </div>
    </>
  );
}