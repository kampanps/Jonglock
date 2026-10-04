import "./globals.css";
import SpaceBackground from "@/components/SpaceBackground";
import GlobalLoader from "@/components/GlobalLoader";
import { Noto_Sans_Thai } from "next/font/google";
const font = Noto_Sans_Thai({ subsets: ["thai", "latin"] });
export const metadata = { title: "จองล็อกร้านค้า งานหลวงพ่อสิงห์" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="th"><body className={font.className}><SpaceBackground /><GlobalLoader />{children}</body></html>;
}
