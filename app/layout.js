import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/site.config";

export const metadata = {
  title: `${site.name} — Nezavisno savjetovanje za robotsku automatizaciju`,
  description:
    "Nezavisni konzultanti za automatizaciju proizvodnje: procjena isplativosti, EU i HR sufinanciranje, povezivanje s provjerenim hrvatskim integratorima.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
