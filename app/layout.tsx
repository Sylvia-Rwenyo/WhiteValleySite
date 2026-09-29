import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/header"; 
import { Footer } from "../components/footer"; 

export const metadata: Metadata = {
  title: "White Valley Florist | Local Flower Orders and Export Collection",
  description: "Fresh premium-grade flowers for order in Nairobi, Kenya.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}