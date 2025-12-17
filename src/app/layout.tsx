import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import { ToastProvider } from "@/components/ToastProvider";
import "@aws-amplify/ui-react/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bill Splitr",
  description: "Split expenses with your group effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          <ConfigureAmplifyClientSide />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
