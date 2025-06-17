import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, arbitrum } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'demAI',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [mainnet, arbitrum, sepolia],
  ssr: true,
})
