import type React from "react"
import "@/styles/globals.css"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ConditionalHeader } from "@/components/conditional-header"
import { AuthProvider } from "@/context/AuthContext"

const brandFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Nilaya AI  Intelligent Automation Platform",
  description:
    "Nilaya AI helps modern teams automate workflows, connect data, and build intelligent systems that scale.",
  generator: "v0.dev",
  icons: {
    icon: "/brand/nilaya-icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${brandFont.className} antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ConditionalHeader />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
