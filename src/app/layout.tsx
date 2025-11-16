// Root layout - apenas para importar estilos globais
// O layout de locale ([locale]/layout.tsx) gerencia o <html> e <body>
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

