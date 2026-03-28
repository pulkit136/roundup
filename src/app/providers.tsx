"use client";

import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const flowTestnet = {
  id: 545,
  name: "Flow EVM Testnet",
  nativeCurrency: { name: "FLOW", symbol: "FLOW", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.evm.nodes.onflow.org"] },
  },
  blockExplorers: {
    default: { name: "Flowdiver", url: "https://evm-testnet.flowdiver.io" },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: "Roundup",
  projectId: "48dbfebec180c369507907a2be68b544",
  chains: [flowTestnet],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: "#10b981",
          accentColorForeground: "#0f172a",
          borderRadius: "medium",
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}