import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import DemaiLayout from '@/components/DemaiLayout'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} font-sans`}>
      <DemaiLayout>
        <Toaster position="bottom-left" toastOptions={{ className: 'text-sm font-medium' }} />
        <Component {...pageProps} />
      </DemaiLayout>
    </div>
  )
}
