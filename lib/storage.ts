import { supabase } from "@/lib/supabase";

export async function subirFotos(
  archivos: File[],
  numeroDia: number
): Promise<string[]> {
  const rutas: string[] = [];

  for (const archivo of archivos) {
    const nombreSeguro = archivo.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

    const ruta = `fotos/${numeroDia}/${nombreSeguro}`;

    const { error } = await supabase.storage
      .from("recuerdos")
      .upload(ruta, archivo, {
        upsert: false,
      });

    if (error) {
      throw new Error(
        `No se pudo subir ${archivo.name}: ${error.message}`
      );
    }

    rutas.push(ruta);
  }

  return rutas;
}

export async function subirVideo(
  archivo: File,
  numeroDia: number
) {
  const ruta = `videos/${numeroDia}/${archivo.name}`;

  const { error } = await supabase.storage
    .from("recuerdos")
    .upload(ruta, archivo, {
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return ruta;
}

export async function obtenerUrlFirmada(
  ruta: string
): Promise<string> {
  if (!ruta) return "";

  const { data, error } = await supabase.storage
    .from("recuerdos")
    .createSignedUrl(ruta, 3600);

  if (error || !data?.signedUrl) {
    console.error(
      "Error obteniendo URL firmada:",
      ruta,
      error
    );
    return "";
  }

  return data.signedUrl;
}