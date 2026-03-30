import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  title: "Space2Standard | Crafted to Perfection",
  description: "Luxury carpentry and bespoke furniture design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} font-sans bg-[#1a1a2e] text-[#e8d5b7]`}>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#16213e',
            color: '#e8d5b7',
            border: '1px solid #c9a84c20',
          },
        }} />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
