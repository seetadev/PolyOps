import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccount, useBalance } from "wagmi";

import DelayedProgressBar from "../common/DelayedProgressBar";
import FollowDalnFooter from "../FollowDalnFooter";

interface HasTokenLayoutProps {
  children: React.ReactNode;
}

// This is a layout component that will be used in the pages that require the user to have a token. If the user does not have the token, it will redirect to the token creation page.
const HasTokenLayout = ({ children }: HasTokenLayoutProps) => {
  const { address } = useAccount();

  const balanceQuery = useBalance({
    address,
    // TODO: Add SPN token address. Now fetching eth balance
    // tokenAddress: '0x0',
  });

  const router = useRouter();

  useEffect(() => {
    if (balanceQuery.isSuccess && balanceQuery.data?.value.lte(0)) {
      void router.replace("/user/onboarding/no-token");
    }
  }, [balanceQuery.isSuccess, balanceQuery.data, router]);

  if (balanceQuery.isError) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        flex={1}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error loading your token balance
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          We&apos;re sorry, an error occurred while loading your token balance.
          Please try again or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  if (balanceQuery?.data?.value.gt(0))
    return (
      <Flex flex={1} direction="column" w="full">
        {children}
      </Flex>
    );

  return <DelayedProgressBar />;
};

export default HasTokenLayout;
