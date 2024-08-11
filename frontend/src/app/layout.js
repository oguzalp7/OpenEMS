
import { Providers } from "./providers";


export const metadata = {
  title: "Müberya Sağlam Pro. Make-up",
  description: "Müberya Sağlam Pro Make-up",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
