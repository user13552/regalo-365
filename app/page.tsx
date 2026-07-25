"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { obtenerUrlFirmada } from "@/lib/storage";
import { useRouter } from "next/navigation";

import { Playfair_Display, Poppins, Dancing_Script, Cormorant_Garamond,} from "next/font/google";

type Dia = {
  id: number;
  fecha: string;
  dia: number;

  cancion: string;
  enlace: string;
  mensaje: string;

  fotos: string[];
  fotosUrl: string[];

  aviso: string;

  videoRegalo: string;
  textoVideoRegalo: string;

  enlaceExtra: string;
  textoEspecialTitulo: string;
  textoEspecial: string;
};

const playfair = Playfair_Display({
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dancing = Dancing_Script({
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const videosBienvenida = [
  "/login/video1.mp4",
  "/login/video2.mp4",
  "/login/video3.mp4",
  "/login/video4.mp4",
  "/login/video5.mp4",
  "/login/video6.mp4",
  "/login/video7.mp4",
  "/login/video8.mp4",
  "/login/video9.mp4",
];

/*
  Esta función decide qué vídeo mostrar
  según la fecha actual.
*/
function obtenerVideoFondo(fecha: Date) {

  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const anio = fecha.getFullYear();

  // Invierno
  if (mes === 1) {
    return "/fondos/enero.mp4";
  }
  if (mes === 2) {
    return "/fondos/febrero.mp4";
  }
  if (mes === 3) {
    return "/fondos/marzo.mp4";
  }
  if (mes === 4) {
    return "/fondos/abril.mp4";
  }
  if (mes === 5 && dia !== 9 && dia!== 11) {
    return "/fondos/mayo.mp4";
  }
  if (mes === 6) {
    return "/fondos/junio.mp4";
  }
  if (mes === 7) {
    return "/fondos/julio.mp4";
  }
  if (mes === 8) {
    return "/fondos/agosto.mp4";
  }
  if (mes === 9) {
    return "/fondos/septiembre.mp4";
  }
  if (mes === 10) {
    return "/fondos/octubre.mp4";
  }
  if (mes === 11 && dia !== 20) {
    return "/fondos/noviembre.mp4";
  }
  if (mes === 12) {
    return "/fondos/diciembre.mp4";
  }

  if (mes === 12 || mes === 1 || mes === 2) {
    return "/fondos/invierno.mp4";
  }

  // Cumpleaños papá
  if (dia === 9 && mes === 5 && anio === 2027) {
    return "/fondos/9 de mayo.mp4";
  }

  // Cumpleaños mamá
  if (dia === 11 && mes === 5 && anio === 2027) {
    return "/fondos/11 de mayo.mp4";
  }

  // Juegos del hambre
  if (dia === 20 && mes === 11 && anio === 2026) {
    return "/fondos/20 noviembre.mp4";
  }
}

export default function Home() {
const router = useRouter();
const [indiceDia, setIndiceDia] = useState(0);
const [usuario, setUsuario] = useState<"celia" | "albita" | null>(null);
const [password, setPassword] = useState("");
const [errorLogin, setErrorLogin] = useState("");
const [iniciandoSesion, setIniciandoSesion] = useState(false);
const [bienvenidaVista, setBienvenidaVista] = useState(false);
const [animandoDia, setAnimandoDia] = useState(false);
const [videoRegaloAbierto, setVideoRegaloAbierto] = useState(false);
const [mostrarDesbloqueo, setMostrarDesbloqueo] = useState(false);
const [textoEspecialAbierto, setTextoEspecialAbierto] = useState(false);
const [mostrandoCalendario, setMostrandoCalendario] = useState(false);
const [videoBienvenida, setVideoBienvenida] = useState("/login/video1.mp4");
const [mesCalendario, setMesCalendario] = useState(
  new Date(2026, 6, 1)
);
type Usuario = {
  email: string;
  nombre: string;
  rol: string;
};

const [usuarioBD, setUsuarioBD] =
  useState<Usuario | null>(null);
const [comprobandoSesion, setComprobandoSesion] = useState(true);
const [iniciandoGoogle, setIniciandoGoogle] = useState(false);
const [diasBD, setDiasBD] = useState<Dia[]>([]);
const [cargandoDias, setCargandoDias] = useState(true);
const [errorDias, setErrorDias] = useState("");
const [videoFondoUrl, setVideoFondoUrl] = useState("");



useEffect(() => {
  let activo = true;

  async function comprobarSesion() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (!activo) return;

    if (error) {
      console.error(
        "Error al comprobar la sesión:",
        error
      );

      setUsuarioBD(null);
      setUsuario(null);
      setComprobandoSesion(false);
      return;
    }

    const email = session?.user?.email;
    

if (!email) {
  setUsuarioBD(null);
  setUsuario(null);
  setComprobandoSesion(false);
  return;
}

const { data: usuarioBDEncontrado, error: errorUsuario } = await supabase
  .from("usuarios")
  .select("email, nombre, rol")
  .eq("email", email.toLowerCase())
  .single();



if (errorUsuario || !usuarioBDEncontrado) {
  await supabase.auth.signOut();

  if (!activo) return;

  setUsuarioBD(null);
  setUsuario(null);
  setErrorLogin(
    "Este correo no está autorizado para acceder."
  );
  setComprobandoSesion(false);
  return;
}

setUsuarioBD(usuarioBDEncontrado);
setComprobandoSesion(false);
  }
  comprobarSesion();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    async (_evento, session) => {
      if (!activo) return;

      const email = session?.user?.email;

      if (!email) {
        setUsuarioBD(null);
        setUsuario(null);
        setBienvenidaVista(false);
        setComprobandoSesion(false);
        return;
      }

      const {
  data: usuarioBDEncontrado,
  error: errorUsuario,
} = await supabase
  .from("usuarios")
  .select("email, nombre, rol")
  .eq("email", email.toLowerCase())
  .single();

if (errorUsuario || !usuarioBDEncontrado) {
  await supabase.auth.signOut();

  if (!activo) return;

  setUsuarioBD(null);
  setUsuario(null);
  setErrorLogin(
    "Este correo no está autorizado para acceder."
  );
  setComprobandoSesion(false);
  return;
}

setUsuarioBD(usuarioBDEncontrado);
setComprobandoSesion(false);
      setComprobandoSesion(false);
    }
  );

  return () => {
    activo = false;
    subscription.unsubscribe();
  };
}, []);

useEffect(() => {
  if (!usuarioBD) {
    setDiasBD([]);
    setCargandoDias(false);
    return;
  }

  let activo = true;

  async function cargarDiasDesdeSupabase() {
    setCargandoDias(true);
    setErrorDias("");

    const { data, error } = await supabase
      .from("dias")
      .select(`
        id,
        fecha,
        dia,
        cancion,
        enlace,
        mensaje,
        fotos,
        aviso,
        video_regalo,
        texto_video_regalo,
        enlace_extra,
        texto_especial_titulo,
        texto_especial
      `)
      .order("fecha", { ascending: true });

    if (!activo) return;

    if (error) {
  console.error("Error al cargar los días desde Supabase:");
  console.error(error);
  

  setErrorDias(error.message);
  setCargandoDias(false);
  return;
}

    const diasTransformados: Dia[] = await Promise.all(
  (data ?? []).map(async (registro) => {
    const rutasFotos: string[] = Array.isArray(registro.fotos)
      ? registro.fotos
      : [];


    let fotosUrl: string[] = [];
    let videoRegaloUrl = "";

    if (rutasFotos.length > 0) {
      const {
        data: urlsFirmadas,
        error: errorFotos,
      } = await supabase.storage
        .from("recuerdos")
        .createSignedUrls(rutasFotos, 86400);

        
      if (errorFotos) {
        console.error(
          `Error cargando fotos del día ${registro.id}:`,
          errorFotos
        );
      } else {
        fotosUrl = (urlsFirmadas ?? [])
          .map((foto) => foto.signedUrl)
          .filter(
            (url): url is string =>
              typeof url === "string"
          );
      }

      if (registro.video_regalo) {
  const {
    data: videoFirmado,
    error: errorVideo,
  } = await supabase.storage
    .from("recuerdos")
    .createSignedUrl(
      registro.video_regalo,
      86400
    );

  if (!errorVideo && videoFirmado?.signedUrl) {
    videoRegaloUrl = videoFirmado.signedUrl;
  } else {
    // simplemente no habrá vídeo
    videoRegaloUrl = "";
  }
}

      
    }

    return {
  id: registro.id,
  fecha: registro.fecha,
  dia: registro.dia,

  cancion: registro.cancion ?? "",
  enlace: registro.enlace ?? "",
  mensaje: registro.mensaje ?? "",

  fotos: rutasFotos,
  fotosUrl,

  aviso: registro.aviso ?? "",

  videoRegalo: videoRegaloUrl,

  textoVideoRegalo: registro.texto_video_regalo ?? "",

  enlaceExtra: registro.enlace_extra ?? "",

  textoEspecialTitulo:
    registro.texto_especial_titulo ?? "",

  textoEspecial:
    registro.texto_especial ?? "",
};
  })
);

    setDiasBD(diasTransformados);
    setCargandoDias(false);

    
  }

  cargarDiasDesdeSupabase();

  return () => {
    activo = false;
  };
}, [usuarioBD]);

useEffect(() => {
  if (usuario !== null && !bienvenidaVista) {
    const temporizador = setTimeout(() => {
      setBienvenidaVista(true);
    }, 3000);

    return () => clearTimeout(temporizador);
  }
}, [usuario, bienvenidaVista]);

  const diaActual = diasBD[indiceDia];

  // Fecha inicial del regalo
  const fechaInicio = new Date(2026, 6, 31);

  // Calculamos la fecha correspondiente
  const fechaActual = new Date(fechaInicio);
  

  fechaActual.setDate(
    fechaInicio.getDate() + indiceDia
  );

fechaActual.setHours(0, 0, 0, 0);

  const fechaTexto =
  fechaActual.toLocaleDateString("es-ES");

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

const diasDisponibles = diasBD.map((_, indice) => {
  const fecha = new Date(fechaInicio);

  fecha.setDate(
    fechaInicio.getDate() + indice
  );

  fecha.setHours(0, 0, 0, 0);

  return fecha <= hoy;
});

const ultimoDiaDisponible =
  diasDisponibles.lastIndexOf(true);

const diaDisponible = fechaActual <= hoy;

const puedeVerDia =
  usuario === "celia" || diaDisponible;

//Datos del calendario

const anioCalendario = mesCalendario.getFullYear();
const numeroMesCalendario = mesCalendario.getMonth();

const primerMesPermitido = new Date(2026, 6, 1);
const ultimoMesPermitido = new Date(2027, 6, 1);

const puedeIrMesAnterior =
  mesCalendario > primerMesPermitido;

const puedeIrMesSiguiente =
  mesCalendario < ultimoMesPermitido;

const nombreMesCalendario = mesCalendario.toLocaleDateString(
  "es-ES",
  {
    month: "long",
    year: "numeric",
  }
);

const diasDelMes = new Date(
  anioCalendario,
  numeroMesCalendario + 1,
  0
).getDate();

const primerDiaSemana = new Date(
  anioCalendario,
  numeroMesCalendario,
  1
).getDay();

const huecosIniciales =
  primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;


  // Elegimos el vídeo

 useEffect(() => {
  async function cargarVideoFondo() {
    const ruta = obtenerVideoFondo(fechaActual);

    if (!ruta) {
      setVideoFondoUrl("");
      return;
    }

    const url = await obtenerUrlFirmada(ruta);
    setVideoFondoUrl(url);
  }

  cargarVideoFondo();
}, [indiceDia]);

 function seleccionarPerfil(
  perfil: "celia" | "albita"
) {
  const correo =
    usuarioBD?.email.toLowerCase();

  if (!correo) {
    setErrorLogin("No se ha podido comprobar el correo.");
    return;
  }

  // Alba solo puede entrar en su propio perfil
  if (
  usuarioBD?.nombre === "Alba" &&
  perfil === "celia"
) {
  setErrorLogin(
    "Este perfil no está disponible para esta cuenta."
  );
  return;
}

  const videoAleatorio =
    videosBienvenida[
      Math.floor(
        Math.random() * videosBienvenida.length
      )
    ];

  setVideoBienvenida(videoAleatorio);
  setUsuario(perfil);
  setBienvenidaVista(false);
  setErrorLogin("");
}

 function irADia(indice: number) {
  if (
    usuario === "albita" &&
    !diasDisponibles[indice]
  ) {
    return;
  }

  cambiarDia(indice);
  setMostrandoCalendario(false);
}

  function cambiarDia(nuevoIndice: number) {
  setAnimandoDia(true);
  setTextoEspecialAbierto(false);
  setVideoRegaloAbierto(false);

  setTimeout(() => {
    setIndiceDia(nuevoIndice);
    setAnimandoDia(false);
  }, 250);
}

async function iniciarSesionGoogle() {
  setErrorLogin("");
  setIniciandoGoogle(true);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    console.error(
      "Error al iniciar sesión con Google:",
      error
    );

    setErrorLogin(
      "No se pudo iniciar sesión con Google."
    );

    setIniciandoGoogle(false);
  }
}



function mostrarTapaDesbloqueo() {
  setMostrarDesbloqueo(true);

  setTimeout(() => {
    setMostrarDesbloqueo(false);
  }, 2500);
}
function irAHoy() {
  cambiarDia(ultimoDiaDisponible);
  mostrarTapaDesbloqueo();
}
function diaAnterior() {
    if (indiceDia > 0) {
      cambiarDia(indiceDia - 1);
    }
  }

function mesAnterior() {
  setMesCalendario(
    new Date(
      mesCalendario.getFullYear(),
      mesCalendario.getMonth() - 1,
      1
    )
  );
}

function mesSiguiente() {
  setMesCalendario(
    new Date(
      mesCalendario.getFullYear(),
      mesCalendario.getMonth() + 1,
      1
    )
  );
}
async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(
      "Error al cerrar sesión:",
      error
    );
    return;
  }

  setUsuario(null);
  setUsuarioBD(null);
  setPassword("");
  setErrorLogin("");
  setBienvenidaVista(false);
  setIndiceDia(0);
  setMostrandoCalendario(false);
}


if (
  usuario === "albita" &&
  ultimoDiaDisponible === -1
) {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source
          src="/fondos/video-espera.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/40 -z-10" />

      <button
        onClick={cerrarSesion}
        className="fixed top-5 right-5 z-[9999] transition-transform hover:scale-105"
        aria-label="Cerrar sesión"
      >
        <img
          src="/botones/salir.png"
          alt="Salir"
          className="w-20 sm:w-24"
        />
      </button>

      {usuarioBD?.nombre === "Celia" && (
  <button
    onClick={() => router.push("/admin")}
    className="absolute top-24 right-5 z-20 text-3xl hover:scale-110 transition"
    aria-label="Panel de administración"
    title="Panel de administración"
  >
    ⚙️
  </button>
)}

      <div className="max-w-xl text-white">
        <h1 className="text-3xl sm:text-5xl font-bold mb-5">
          Todavía no es el momento
        </h1>

        <p className="text-lg sm:text-2xl">
          Tu regalo empieza el 31 de julio, así que toca esperar jiji
        </p>
      </div>
    </main>
  );
}



function obtenerIndicePorFecha(fecha: Date) {
  const fechaComparada = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate()
  );

  const inicioComparado = new Date(
    fechaInicio.getFullYear(),
    fechaInicio.getMonth(),
    fechaInicio.getDate()
  );

  const milisegundosPorDia = 1000 * 60 * 60 * 24;

  return Math.round(
    (fechaComparada.getTime() - inicioComparado.getTime()) /
      milisegundosPorDia
  );
}

  function diaSiguiente() {

  const siguienteIndice = indiceDia + 1;

  if (siguienteIndice >= diasBD.length) {
    return;
  }

  if (
    usuario === "albita" &&
    !diasDisponibles[siguienteIndice]
  ) {
    return;
  }

  cambiarDia(siguienteIndice);
  if (
  usuario === "albita" &&
  siguienteIndice === ultimoDiaDisponible
) {
  mostrarTapaDesbloqueo();
}
}

function abrirCalendario() {
  setMesCalendario(
    new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      1
    )
  );

  setMostrandoCalendario(true);
}



if (comprobandoSesion) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <p className="text-white text-xl">
        Cargando...
      </p>
    </main>
  );
}

if (!usuarioBD) {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#031827] p-6">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="/login/intro.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative z-10 bg-black/40 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-white/20">
        <img
          src="/login/365 DÍAS.png"
          alt="365 días contigo"
          className="w-full max-w-xs mx-auto mb-8"
        />

        {errorLogin && (
          <p className="text-red-300 text-sm mb-4">
            {errorLogin}
          </p>
        )}

        <button
          onClick={iniciarSesionGoogle}
          disabled={iniciandoGoogle}
          className="w-full rounded-full bg-white px-6 py-3 text-black font-semibold shadow-lg transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
        >
          {iniciandoGoogle
            ? "Abriendo Google..."
            : "Continuar con Google"}
        </button>
      </div>
    </main>
  );
}

if (usuarioBD && usuario === null) {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#031827] p-6">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="/login/intro.mp4"
          type="video/mp4"
        />
      </video>

      <button
        onClick={cerrarSesion}
        className="absolute top-5 right-5 z-20 transition-transform hover:scale-105"
        aria-label="Cerrar sesión"
      >
        <img
          src="/botones/salir.png"
          alt="Salir"
          className="w-20 h-auto"
        />
      </button>

      {usuarioBD?.nombre === "Celia" && (
  <button
    onClick={() => router.push("/admin")}
    className="absolute top-28 right-5 z-20 bg-purple-700 text-white px-3 py-2 rounded-lg"
  >
    Admin
  </button>
)}

      <div className="relative z-10 bg-black/40 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-white/20">
        <img
          src="/login/365 DÍAS.png"
          alt="365 días contigo"
          className="w-full max-w-xs mx-auto mb-8"
        />

        <p className="text-white text-xl mb-6">
          ¿Con qué perfil quieres entrar?
        </p>

        <div className="flex flex-col gap-3">
  {usuarioBD?.nombre === "Celia" && (
    <button
      onClick={() => seleccionarPerfil("celia")}
      className="transition-transform hover:scale-105"
    >
      <img
        src="/login/CELIA.png"
        alt="Celia"
        className="w-80 h-auto"
      />
    </button>
  )}

  <button
    onClick={() => seleccionarPerfil("albita")}
    className="transition-transform hover:scale-105"
  >
    <img
      src="/login/ALBA.png"
      alt="Alba"
      className="w-80 h-auto"
    />
  </button>
</div>
      </div>
    </main>
  );
}


const imagenBienvenida =
  usuario === "celia"
    ? "/login/celitacarga.png"
    : "/login/albitacarga.png";

if (!bienvenidaVista) {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <video
        key={videoBienvenida}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoBienvenida} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/40 z-10"></div>

      <div className="relative z-20 flex items-center justify-center">
        <img
          src={imagenBienvenida}
          alt="Bienvenida"
          className="w-96 max-w-full"
        />
      </div>
    </main>
  );
}

if (mostrandoCalendario) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-200 to-purple-300 p-4">
      <div className="bg-white/85 backdrop-blur-md p-5 sm:p-7 rounded-3xl shadow-xl w-full max-w-lg text-center">

        {/* Cabecera del calendario */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={mesAnterior}
            disabled={!puedeIrMesAnterior}
            className="
              text-3xl text-black px-3 py-1 rounded-full
              hover:bg-pink-100 transition
              disabled:opacity-30
              disabled:cursor-not-allowed
                "
              aria-label="Mes anterior"
            >
            ← 
          </button>

          <h1 className="text-2xl font-semibold text-pink-600 capitalize">
            {nombreMesCalendario}
          </h1>

          <button
            onClick={mesSiguiente}
            disabled={!puedeIrMesSiguiente}
            className="
            text-3xl text-black px-3 py-1 rounded-full
            hover:bg-pink-100 transition
            disabled:opacity-30
            disabled:cursor-not-allowed
            "
            aria-label="Mes siguiente"
            >
             →
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-sm font-semibold text-gray-600">
          <div>L</div>
          <div>M</div>
          <div>X</div>
          <div>J</div>
          <div>V</div>
          <div>S</div>
          <div>D</div>
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2 mb-7">

          {/* Huecos antes del día 1 */}
          {Array.from({ length: huecosIniciales }).map((_, indice) => (
            <div key={`hueco-${indice}`} />
          ))}

          {/* Días */}
          {Array.from({ length: diasDelMes }).map((_, indice) => {
            const numeroDia = indice + 1;

            const fechaDelCalendario = new Date(
              anioCalendario,
              numeroMesCalendario,
              numeroDia
            );

            const indiceDelDia =
              obtenerIndicePorFecha(fechaDelCalendario);

            const diaCreado =
              indiceDelDia >= 0 &&
              indiceDelDia < diasBD.length;

            const diaDesbloqueado =
              diaCreado &&
              (
                usuario === "celia" ||
                diasDisponibles[indiceDelDia]
              );

            const esDiaSeleccionado =
              diaCreado &&
              indiceDelDia === indiceDia;

            return (
              <button
                key={numeroDia}
                onClick={() => {
                  if (diaDesbloqueado) {
                    irADia(indiceDelDia);
                  }
                }}
                disabled={!diaDesbloqueado}
                className={`
                  aspect-square rounded-xl text-sm font-semibold
                  transition-all duration-200
                  flex items-center justify-center

                  ${
                    esDiaSeleccionado
                      ? "bg-purple-600 text-white scale-105"
                      : diaDesbloqueado
                        ? "bg-pink-400 text-white hover:bg-pink-500 hover:scale-105"
                        : diaCreado
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }
                `}
              >
                {diaCreado && !diaDesbloqueado
                  ? "🔒"
                  : numeroDia}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setMostrandoCalendario(false)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full transition"
        >
          Volver
        </button>
      </div>
    </main>
  );
}

if (cargandoDias) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Cargando días...</p>
    </main>
  );
}

if (errorDias) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>No se han podido cargar los días.</p>
        <p className="text-sm">{errorDias}</p>
      </div>
    </main>
  );
}



  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">

      {/* VIDEO DE FONDO */}
      <video
  key={videoFondoUrl}
  autoPlay
  muted
  loop
  playsInline
  className="fixed top-0 left-0 w-full h-full object-cover -z-10"
>
  <source
    src={videoFondoUrl}
    type="video/mp4"
  />
</video>

      {/* TARJETA CENTRAL */}
      <div
  className={`
    relative z-10 bg-white/60 backdrop-blur-md pt-24 px-8 pb-8 rounded-3xl shadow-xl max-w-md text-center
    transition-all duration-300 ease-in-out
    ${animandoDia ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
  `}
>
  {mostrarDesbloqueo && (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-3xl animate-pulse">
    <p className="text-6xl mb-4">✨</p>
    <h2 className="text-3xl font-bold text-pink-600 mb-2">
      Nuevo recuerdo desbloqueado
    </h2>
    <p className="text-gray-700">
      Preparando tu sorpresa de hoy...
    </p>
  </div>
)}

<div className="absolute top-4 right-4 z-30">
  <button
    onClick={cerrarSesion}
    className="transition-all duration-300 hover:scale-105"
  >
    <img
      src="/botones/salir.png"
      alt="Salir"
      className="w-24 h-auto"
    />
  </button>
</div>



<div className="absolute top-4 left-5 z-30">
  <button
    onClick={abrirCalendario}
    className="transition-all duration-300 hover:scale-105"
  >
    <img
      src="/botones/calendario.png"
      alt="Calendario"
      className="w-20 h-auto"
    />
  </button>
</div>
  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
  {usuario === "albita" && indiceDia !== ultimoDiaDisponible && (
    <button
      onClick={irAHoy}
      className="transition-all duration-300 hover:scale-105"
    >
      <img
        src="/botones/hoy.png"
        alt="Ir a hoy"
        className="w-36 h-auto"
      />
    </button>
  )}
</div>
        <h1 className={`${playfair.className} text-4xl text-black mb-10`}>
          {fechaTexto}
        </h1>
{puedeVerDia ? (
  <>
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-3xl shadow-xl">
            {(diaActual.fotosUrl ?? []).length > 0 ? (
  <div className="flex flex-col gap-4 items-center w-full">
    {(diaActual.fotosUrl ?? []).map((fotoUrl, indice) => (
      <img
        key={`${diaActual.id}-${indice}`}
        src={fotoUrl}
        alt={`Foto ${indice + 1} del día`}
        className="max-w-full h-auto rounded-xl object-contain"
      />
    ))}
  </div>
) : null}
          </div>
        </div>

        <h2 className={`${poppins.className} text-2xl text-purple-700 mb-2`}>
          🎵 {diaActual.cancion}
        </h2>

        <p className={`${cormorant.className} text-3xl text-pink-600 mb-2`}>
          {diaActual.mensaje}
        </p>

        {diaActual.aviso && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 p-4 rounded-2xl mb-6">
            {diaActual.aviso}
          </div>
        )}

        <a
          href={diaActual.enlace}
          target="_blank"
          className="inline-block mb-6 transition-all duration-300 hover:scale-105"
        >
          <img
            src="/botones/cancion.png"
            alt="Escuchar canción"
            className="w-44 h-auto mx-auto"
          />
        </a>
        <div className="flex justify-center gap-2">
        {diaActual.videoRegalo && (
          <button
            onClick={() => setVideoRegaloAbierto(true)}
            className="transition-all duration-300 hover:scale-105"
          >
          <img
            src="/botones/regalo.png"
            alt={diaActual.textoVideoRegalo || "Ver vídeo regalo"}
            className="w-44 h-auto"
          />
          </button>
        )}
        </div>

        {diaActual.textoEspecial && (
          <button
          onClick={() => setTextoEspecialAbierto(true)}
          className="inline-block transition-all duration-300 hover:scale-105"
          >
          <img
          src="/botones/regalo.png"
          alt={diaActual.textoEspecialTitulo || "Abrir texto especial"}
          className="w-44 h-auto"
          />
          </button>
        )}

        {diaActual.enlaceExtra && (
        <a
          href={diaActual.enlaceExtra}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-all duration-300 hover:scale-105"
        >
          <img
          src="/botones/regalo.png"
          alt="Abrir enlace especial"
          className="w-44 h-auto"
        />
        </a>
        )}
        </>
) : (
  <div className="p-8">
    <p className="text-6xl mb-4">🔒</p>
    <p className="text-xl text-gray-700">
      Este recuerdo aún no está disponible.
    </p>
  </div>
)}

        <div className="flex justify-center items-center gap-4">
  {indiceDia > 0 && (
    <button
      onClick={diaAnterior}
      className="transition-all duration-300 hover:scale-105"
    >
      <img
        src="/botones/diaanterior.png"
        alt="Día anterior"
        className="w-36 h-auto"
      />
    </button>
  )}

  <button
    onClick={diaSiguiente}
    disabled={
      usuario === "albita" &&
      indiceDia + 1 < diasBD.length &&
      !diasDisponibles[indiceDia + 1]
    }
    className="
      transition-all
      duration-300
      hover:scale-105
      disabled:opacity-40
      disabled:cursor-not-allowed
      disabled:hover:scale-100
    "
  >
    <img
      src="/botones/diasiguiente.png"
      alt="Día siguiente"
      className="w-36 h-auto"
    />
  </button>
</div>

      </div>

    {videoRegaloAbierto && diaActual.videoRegalo && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
    <div className="relative w-full max-w-3xl">
      <button
        onClick={() => setVideoRegaloAbierto(false)}
        className="absolute -top-12 right-0 text-white text-xl"
      >
        ✕ Cerrar
      </button>

      <video
        controls
        autoPlay
        playsInline
        className="w-full max-h-[80vh] rounded-2xl bg-black"
      >
        <source
  src={diaActual.videoRegalo}
  type="video/mp4"
/>
      </video>
    </div>
  </div>
)}

{textoEspecialAbierto && diaActual.textoEspecial && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
    <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl">

      <button
        onClick={() => setTextoEspecialAbierto(false)}
        className="absolute top-4 right-5 text-2xl text-gray-700 hover:text-black"
        aria-label="Cerrar texto especial"
      >
        ✕
      </button>

      <h2 className="text-3xl font-bold text-pink-600 mb-6 pr-8">
        {diaActual.textoEspecialTitulo || "Para ti ❤️"}
      </h2>

      <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line text-left">
        {diaActual.textoEspecial}
      </p>
    </div>
  </div>
)}

    </main>
  );
}