import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectAcademy by ZirconAI — L'IA ouvre le champ des possibles",
  description:
    "Découvrez les solutions intelligentes de ZirconAI et inscrivez-vous à nos formations gratuites en intelligence artificielle et cybersécurité.",
  metadataBase: new URL("https://projectacademy.zirconai.fr"),
  openGraph: {
    title: "ProjectAcademy by ZirconAI",
    description: "Formez-vous à l'IA et à la cybersécurité. Découvrez nos solutions SaaS intelligentes.",
    url: "https://projectacademy.zirconai.fr",
    siteName: "ProjectAcademy",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
