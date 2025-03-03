'use client'

import React from 'react'
import '../../../src/app/globals.css'
import { usePathname } from 'next/navigation'
import Navbar from '../(frontend)/components/Navbar'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // Only show navbar on todos page
  const showNavbar = pathname === '/todos'

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#0B1120] text-white transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider>
            {showNavbar && <Navbar />}
            <main className="flex-1 flex flex-col">{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
