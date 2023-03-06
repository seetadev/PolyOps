import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  CircularProgress,
  HStack,
  Progress,
} from "@chakra-ui/react";
import { useAccountModal } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { erc721ABI, useAccount, useConnect, useContractRead } from "wagmi";

import OnBoardingCenteredCard from "~~/components/OnBoardingCenteredCard";
import OnBoardingContentPiece from "~~/components/OnBoardingContentPiece";
import OnBoardingHeaderComponent from "~~/components/OnBoardingHeaderComponent";
import PageTransition from "~~/components/PageTransition";
import WalletConnectionCheck from "~~/components/WalletConnectionCheck";
import { SpendAdmin } from "~~/oldContracts";

const OnboardingNotConnected = () => {
  const { openAccountModal } = useAccountModal();
  const { address } = useAccount();
  const router = useRouter();

  const [shouldLoad, setShouldLoad] = useState(true);

  const adminTokenBalanceQuery = useContractRead({
    // TODO: Replace with new contract address
    address: SpendAdmin.polygonMumbai as `0x${string}`,
    abi: erc721ABI,
    functionName: "balanceOf",
    args: [address || "0x0"],
    enabled: !!address,
    onSettled: () => {
      setShouldLoad(false);
    },
  });

  useEffect(() => {
    if (!address) {
      setShouldLoad(false);
    }

    if (address && !adminTokenBalanceQuery.isLoading) {
      if (adminTokenBalanceQuery.data && adminTokenBalanceQuery.data?.gt(0)) {
        void router.replace("/admin/dashboard");
      }
    }
  }, [
    address,
    adminTokenBalanceQuery.data,
    adminTokenBalanceQuery.isLoading,
    router,
  ]);

  return (
    <>
      <Head>
        <title>DALN - Admin</title>
      </Head>

      {address && shouldLoad ? (
        <PageTransition>
          <Center h="100vh">
            <CircularProgress isIndeterminate />
          </Center>
        </PageTransition>
      ) : (
        <PageTransition>
          <OnBoardingCenteredCard
            prependedContent={
              <>
                <OnBoardingHeaderComponent
                  title="DALN"
                  description="Be the shepherd for a vibrant data economy"
                />
              </>
            }
          >
            <HStack mb={24}>
              <OnBoardingContentPiece
                title="Access valuable data"
                content="Access valuable data crowd-sourced by DAO members"
              />
              <OnBoardingContentPiece
                title="Reward DAO members"
                content="Reward DAO members for their contribution to the data economy"
              />
              <OnBoardingContentPiece
                title="Protect data privacy"
                content="Get behavioral insights without compromising data privacy"
              />
            </HStack>

            <Center pos="relative">
              <AnimatePresence>
                {address &&
                  !adminTokenBalanceQuery.isLoading &&
                  (!adminTokenBalanceQuery.data ||
                    adminTokenBalanceQuery.data?.lt(1)) && (
                    <Alert
                      justifyContent="center"
                      borderRadius={12}
                      status="warning"
                      alignItems="center"
                      colorScheme="orange"
                      variant="subtle"
                      w={400}
                      px={6}
                      pos="absolute"
                      top={-16}
                      as={motion.div}
                      key="admin-nft-not-detected"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <AlertIcon />
                      <AlertTitle color="orange.500">Admin NFT</AlertTitle>
                      <AlertDescription color="orange.500">
                        not detected.{" "}
                        <Button
                          variant="link"
                          onClick={openAccountModal}
                          color="orange.500"
                        >
                          Change wallet?
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                <Box as={motion.div} layout>
                  <WalletConnectionCheck
                    notConnectedProps={{
                      variant: "solid",
                      size: "lg",
                    }}
                  >
                    <NextLink passHref href="/admin/dashboard">
                      <Button
                        isLoading={adminTokenBalanceQuery.isLoading}
                        isDisabled={!adminTokenBalanceQuery.data?.gte(1)}
                        size="lg"
                      >
                        Enter admin dashboard
                      </Button>
                    </NextLink>
                  </WalletConnectionCheck>
                </Box>
              </AnimatePresence>
            </Center>
          </OnBoardingCenteredCard>
        </PageTransition>
      )}
    </>
  );
};

export default OnboardingNotConnected;
