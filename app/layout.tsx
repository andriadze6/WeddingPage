import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anano & Giorgi | Wedding Invitation",
  description: "Wedding invitation for Anano and Giorgi in Tuscany, Italy.",
};

export const viewport: Viewport = {
  themeColor: "#F3F1EC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
