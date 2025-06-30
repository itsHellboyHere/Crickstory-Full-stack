'use client'

import { useTheme } from '../context/ThemeContext'
import { Toaster } from 'react-hot-toast'

export default function ThemeClientWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme()

    return (
        <html className={theme === 'dark' ? 'dark' : ''}>
            <body>
                {children}
                <Toaster position="top-center" />
            </body>
        </html>
    )
}
