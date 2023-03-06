import { Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccount } from "wagmi";

import DelayedProgressBar from "../common/DelayedProgressBar";
import FollowDalnFooter from "../FollowDalnFooter";
import NavBar from "../NavBar";

interface ConnectedLayoutProps {
  children: React.ReactNode;
}

// This is a layout component that will be used in the pages that require the user to be connected to the wallet. If the user is not connected, it will redirect to the not-connected page.
const ConnectedLayout = ({ children }: ConnectedLayoutProps) => {
  const { isConnecting, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      void router.replace("/user/onboarding/not-connected");
    }
  }, [isConnecting, isConnected, router]);

  if (isConnected) {
    return (
      <Flex minH="100vh" direction="column">
        <NavBar />
        {children}
        <FollowDalnFooter />
      </Flex>
    );
  }

  return <DelayedProgressBar />;
};

export default ConnectedLayout;
