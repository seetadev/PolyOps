import { Box, Container, Link } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import NextLink from "next/link";

const NavBar = () => {
  return (
    <Container
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      maxW="container.xl"
      py={4}
    >
      <Link as={NextLink} href="/">
        <Box cursor="pointer">
          <Image src="/logo.png" alt="logo" height={32} width={116} />
        </Box>
      </Link>

      <ConnectButton />
    </Container>
  );
};

export default NavBar;
