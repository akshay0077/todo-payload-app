'use client'

import React from 'react'
import '../../../src/app/globals.css'
import { usePathname } from 'next/navigation'
import Navbar from '../(frontend)/components/Navbar'
import { AuthProvider } from './context/AuthContext'

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
      <body>
        <AuthProvider>
          {showNavbar && <Navbar />}
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
