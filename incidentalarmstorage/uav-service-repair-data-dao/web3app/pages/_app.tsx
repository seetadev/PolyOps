import "@rainbow-me/rainbowkit/styles.css";
import {
  Center,
  ChakraProvider,
  CircularProgress,
  Flex,
} from "@chakra-ui/react";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygon, localhost, polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import theme from "~~/styles/theme";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
const queryClient = new QueryClient();

const { chains, provider, webSocketProvider } = configureChains(
  [
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [localhost, polygonMumbai]
      : []),
    polygonMumbai,
  ],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <WagmiConfig client={wagmiClient}>
      <ChakraProvider theme={theme}>
        <RainbowKitProvider chains={chains}>
          <AnimatePresence mode="wait" initial={false}>
            <QueryClientProvider client={queryClient}>
              <Flex minH="100vh" direction="column" w="full" bg="#F1F4F9">
                {getLayout(<Component {...pageProps} />)}
              </Flex>
            </QueryClientProvider>
          </AnimatePresence>
        </RainbowKitProvider>
      </ChakraProvider>
    </WagmiConfig>
  );
}

export default MyApp;
