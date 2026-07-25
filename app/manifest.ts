import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "365 días contigo",
    short_name: "365 días",
    description: "Un recuerdo cada día ❤️",
    start_url: "/",
    display: "standalone",
    background_color: "#031827",
    theme_color: "#031827",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}