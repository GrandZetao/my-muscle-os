import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: { default: "MUSCLE OS", template: "%s · MUSCLE OS" },
  description: "个人增肌计划、训练记录、动作教学与营养目标。",
  robots: { index: false, follow: false },
  applicationName: "Muscle OS",
  appleWebApp: { capable: true, title: "Muscle OS", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#090c10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
