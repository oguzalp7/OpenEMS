import Navbar from "@/components/navbar.component";
import type { Metadata, Viewport } from "next";
import Footer from "@/components/footer.component";
import { getSession } from "@/actions";

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
      <div className="container">
        <Navbar/>
        <div className="content">{children}</div>
        <Footer/>
      </div>
      
        
      </body>
    </html>
  );
}
