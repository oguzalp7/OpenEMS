
import type { Metadata, Viewport } from "next";

import { Providers } from "./providers";
import Navbar from "@/components/navbar.component";
import Footer from "@/components/footer.component";

import { VStack, HStack, Box } from "@chakra-ui/react";


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
        <Home>
          {children}
        </Home>
      </Providers>
      </body>
    </html>
  );
}
