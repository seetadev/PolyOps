import { Center, HStack } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccount } from "wagmi";

import OnBoardingCenteredCard from "~~/components/OnBoardingCenteredCard";
import OnBoardingContentPiece from "~~/components/OnBoardingContentPiece";
import OnBoardingHeaderComponent from "~~/components/OnBoardingHeaderComponent";

const OnboardingNotConnected = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      void router.push("/user/dashboard");
    }
  }, [isConnected, router]);

  return (
    <>
      <Head>
        <title>DALN - Onboarding</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <OnBoardingCenteredCard
        prependedContent={
          <OnBoardingHeaderComponent
            title="DALN"
            description="Your data is more valuable than you think"
          />
        }
      >
        <HStack mb={20}>
          <OnBoardingContentPiece
            title="Control your data"
            content="Have true ownership and governance in the data economy"
          />
          <OnBoardingContentPiece
            title="Get rewards"
            content="Get rewards in Matic whenever your data is decrypted"
          />

          <OnBoardingContentPiece
            title="Preserve privacy"
            content="Pool your anonymized transaction data with other DAO members"
          />
        </HStack>

        <Center>
          <ConnectButton />
        </Center>
      </OnBoardingCenteredCard>
    </>
  );
};

export default OnboardingNotConnected;
