import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sun PhuQuoc Airways",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
