import { Box, Flex, Heading } from "@chakra-ui/react";
import Image from "next/image";
import React from "react";

const OnBoardingHeaderComponent: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => {
  return (
    <Flex justifyContent="center" direction="column" alignItems="center">
      <Box h="112px" maxW="300px" w="100%" pos="relative" mb={4}>
        <Image src="/logo-title.png" layout="fill" quality={100} />
      </Box>
      <Heading as="h2" size="md" textAlign="center">
        {description}
      </Heading>
    </Flex>
  );
};

export default OnBoardingHeaderComponent;
