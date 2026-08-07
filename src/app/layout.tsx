import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dropbase",
  description: "O app de figurinhas dos DJs que fazem a cena eletrônica.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
