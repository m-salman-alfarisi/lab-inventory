import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LabInventory — Sistem Inventaris & Peminjaman Laboratorium",
    template: "%s | LabInventory",
  },
  description:
    "Aplikasi web untuk mengelola inventaris, peminjaman, dan pengembalian barang laboratorium komputer secara digital.",
  keywords: [
    "inventaris laboratorium",
    "peminjaman barang",
    "manajemen laboratorium",
    "lab inventory",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
