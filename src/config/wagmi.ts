import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, arbitrum } from 'wagmi/chains'

// Define the Core chain as a custom chain
const core = {
  id: 1116,
  name: 'Core',
  nativeCurrency: { name: 'Core', symbol: 'CORE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.coredao.org'] },
    public: { http: ['https://rpc.coredao.org'] },
  },
  blockExplorers: {
    default: { name: 'CoreScan', url: 'https://scan.coredao.org' },
  },
  testnet: false,
}

export const config = getDefaultConfig({
  appName: 'demAI',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2a67f22974ea8cfb30070a31b4f8b3c0',
  chains: [mainnet, arbitrum, sepolia, core], // Add core chain here
  ssr: true,
})
