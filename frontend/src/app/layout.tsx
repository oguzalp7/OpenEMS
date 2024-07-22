
import type { Metadata, Viewport } from "next";

import { Providers } from "./providers";



import Home from "./page";

export const metadata: Metadata = {
  title: "MS Management System",
  description: "Employee Management System",
};

export const viewport: Viewport = {
  themeColor: "#3580f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en">
      <body>
      <Providers>
        {children}
      </Providers>
      </body>
    </html>
  );
}
