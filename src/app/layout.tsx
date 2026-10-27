import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HELPi — Lo que te sobra, puede cambiar una vida",
  description:
    "Conectamos donaciones con personas y organizaciones que las necesitan. Encontrá una causa cerca tuyo y ayudá a hacer la diferencia.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
