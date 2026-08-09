import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Muscle OS 个人增肌系统",
    short_name: "Muscle OS",
    description: "离线可用的个人训练、动作与营养系统",
    start_url: "/",
    display: "standalone",
    background_color: "#090c10",
    theme_color: "#090c10",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
