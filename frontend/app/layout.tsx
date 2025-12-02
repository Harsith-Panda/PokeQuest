import "./globals.css";
import { Providers } from "./components/Providers";
import { Inter, Kanit, Orbitron, Press_Start_2P } from "next/font/google";
import { cookies } from "next/headers";

export const metadata = {
  icons: {
    icon: "/favicon.ico",
  },
  title: "PokeQuest | Welcome to the Virtual World of Pokémon",
  description: "Run and explore the world to catch Pokémon!",
};

export function checkCookie() {
  const cookieStore = cookies();
  console.log("Token:", cookieStore);
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-orbitron",
  display: "swap",
});

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-kanit",
  display: "swap",
});

const p2p = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-p2p",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${p2p.variable} ${inter.variable} ${orbitron.variable} ${kanit.variable} font-body antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
