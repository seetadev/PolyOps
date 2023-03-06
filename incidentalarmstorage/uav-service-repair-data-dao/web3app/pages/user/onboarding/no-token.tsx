import {
  Box,
  Center,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Text,
  WrapItem,
  Link,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import JoinDALNButton from "~~/components/JoinDALNButton";
import ConnectedLayout from "~~/components/layouts/ConnectedLayout";
import Card from "~~/components/OnBoardingCard";
import useMutationCreateToken from "~~/hooks/useMutationCreateToken";
import { NextPageWithLayout } from "~~/pages/_app";

const NoTokenPage: NextPageWithLayout = () => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { isLoading, isError, data, mutate } = useMutationCreateToken({});
  const linkToken = data?.data?.link_token || null;
  const router = useRouter();

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <Center
      sx={{
        flex: 1,
      }}
    >
      <Box alignSelf="center" width="80vw">
        <Text textAlign="center" fontSize="lg" mb={8} color="#4A5568">
          Not a DALN member yet?
        </Text>
        <Card>
          <Heading as="h1" size="lg" textAlign="center" mb={2}>
            Join the party 🥳
          </Heading>
          <Heading as="h2" size="md" textAlign="center" mb={10}>
            for true ownership and monetization of your data
          </Heading>
          <WrapItem alignSelf="center">
            <Box justifyContent="start" alignItems="start">
              <HStack spacing="8px" alignItems="end" mb={6}>
                <Heading color={"primary.500"} as="h1" size="xl">
                  1. Upload & Encrypt
                </Heading>
                <Text fontSize="lg">credit card transactions</Text>
              </HStack>
              <HStack spacing="8px" alignItems="end" mb={6}>
                <Heading color={"primary.500"} as="h1" size="xl">
                  2. Mint
                </Heading>
                <Text fontSize="lg">
                  a non-transferrable DAO membership token
                </Text>
              </HStack>
              <HStack spacing="8px" alignItems="end" mb={6}>
                <Heading color={"primary.500"} as="h1" size="xl">
                  3. Get rewards
                </Heading>
                <Text fontSize="lg">for decrypted data</Text>
              </HStack>
              <Flex mb={6}>
                <Checkbox
                  isChecked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <Text ml={2} fontSize="sm">
                  By checking the box, I agree to DALN's{" "}
                  <Link
                    href="https://www.google.com"
                    color={"primary.500"}
                    isExternal
                  >
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="https://www.google.com"
                    color={"primary.500"}
                    isExternal
                  >
                    Privacy Policy.
                  </Link>
                </Text>
              </Flex>
            </Box>
          </WrapItem>

          <Flex justifyContent="center">
            <JoinDALNButton
              linkToken={linkToken}
              isDisabled={!acceptTerms || isError}
              isLoading={isLoading}
              onSuccess={() => {
                void router.replace("user/onboarding/upload-data");
              }}
            >
              Join DALN
            </JoinDALNButton>
          </Flex>
          <Flex justifyContent="center" mt={8}>
            <Text ml={2} maxWidth={720} fontSize="sm" align="center">
              Your data will be temporarily stored on a cloud server and then
              encrypted and uploaded to IPFS. The resulting IPFS link is
              immutable, and the data on the cloud server will be deleted.
            </Text>
          </Flex>
        </Card>
      </Box>
    </Center>
  );
};

NoTokenPage.getLayout = function getLayout(page) {
  return <ConnectedLayout>{page}</ConnectedLayout>;
};

export default NoTokenPage;
