import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, arbitrum } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'demAI',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2a67f22974ea8cfb30070a31b4f8b3c0',
  chains: [mainnet, arbitrum, sepolia],
  ssr: true,
})
