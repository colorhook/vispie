import { SWRProvider } from "@/context/SWRProvider";
import Providers from "./Provider";
import "./preflight.css";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import "./style.css";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="w-full h-full">
        <Toaster position="top-right" richColors />
        <SWRProvider>
          <Providers>{children}</Providers>
        </SWRProvider>
      </body>
    </html>
  );
}