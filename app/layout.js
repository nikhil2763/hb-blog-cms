import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import MotionEffects from "@/components/MotionEffects";
import Toaster from "@/components/Toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: "en_IN", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>" },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0a1a" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <MotionEffects />
        <header className="site-header">
          <div className="container nav">
            <Link href="/blog" className="logo" aria-label={`${SITE_NAME} home`}>HB<span>.</span>blog</Link>
            <nav aria-label="Main">
              <Link href="/blog">Blog</Link>
            </nav>
          </div>
        </header>
        <div id="main" className="page">{children}</div>
        <footer className="site-footer">
          <div className="container">© {new Date().getFullYear()} HB Softweb · Built with Next.js, MongoDB Atlas &amp; Three.js</div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
