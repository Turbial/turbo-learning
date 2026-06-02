// app/+html.tsx — customise the web <head> for the static export
// This file is only used for the web build (expo export --platform web).

import { type PropsWithChildren } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* ── Google Fonts — Space Grotesk (display/headings) + Manrope (body) ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* ── Global font defaults ── */}
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html, body, #root { height: 100%; margin: 0; padding: 0; }
          body { overflow: hidden; font-family: 'Manrope', system-ui, sans-serif; }
        `}</style>

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
