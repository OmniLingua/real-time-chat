import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChatFlow - Real-time Chat Application",
  description: "Connect, chat, and collaborate in real-time with channels and embedding support",
  icons : {
    icon: "https://github.com/OmniLingua/real-time-chat/blob/main/public/chat-icon.png?raw=true",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Suppress MetaMask and other extension errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Suppress MetaMask and Chrome extension errors
            window.addEventListener('error', function(e) {
              if (e.message && (e.message.includes('MetaMask') || e.message.includes('ChromeTransport'))) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            }, true);
            
            // Suppress console errors for MetaMask
            const originalConsoleError = console.error;
            const originalConsoleWarn = console.warn;
            
            console.error = function(...args) {
              if (typeof args[0] === 'string' && (args[0].includes('MetaMask') || args[0].includes('ChromeTransport'))) {
                return;
              }
              originalConsoleError.apply(console, args);
            };
            
            console.warn = function(...args) {
              if (typeof args[0] === 'string' && (args[0].includes('MetaMask') || args[0].includes('ChromeTransport'))) {
                return;
              }
              originalConsoleWarn.apply(console, args);
            };
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
