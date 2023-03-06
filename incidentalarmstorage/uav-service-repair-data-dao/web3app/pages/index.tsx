import {
  Center,
  Flex,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
  Spacer,
  Link,
} from "@chakra-ui/react";
import Head from "next/head";
import NextLink from "next/link";

interface StyledLinkBoxProps extends React.ComponentProps<typeof LinkBox> {
  content: React.ReactNode;
  href: string;
  isDisabled?: boolean;
}

const StyledLinkBox = ({
  href,
  content,
  isDisabled,
  ...rest
}: StyledLinkBoxProps) => {
  return (
    <LinkBox
      sx={{
        width: "full",
        p: 3,
        borderRadius: "md",
        boxShadow: "md",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          transform: "scale(1.05)",
        },
        "&:active": {
          transform: "scale(0.95)",
        },

        ...(isDisabled && {
          opacity: 0.5,
          cursor: "not-allowed",
          pointerEvents: "none",
        }),
      }}
      {...rest}
    >
      <Heading>
        <NextLink href={href} passHref aria-disabled={isDisabled}>
          <LinkOverlay cursor={isDisabled ? "not-allowed" : "pointer"}>
            {content}
          </LinkOverlay>
        </NextLink>
      </Heading>
    </LinkBox>
  );
};

const Home = () => {
  return (
    <>
      <Head>
        <title>DALN</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex padding={4}>
        <Spacer />
        <Link as={NextLink} href="/admin" colorScheme="blue">
          DAO Admin
        </Link>
      </Flex>

      <Center minH="100vh">
        <HStack w="full" maxW="2xl" spacing={10}>
          <StyledLinkBox href="/user/dashboard" content="End User" />
          <StyledLinkBox
            href="/datasubscriber/onboarding/not-connected"
            content="Data subscriber"
          />
        </HStack>
      </Center>
    </>
  );
};

export default Home;
