import { Box, Heading, Text, ChakraProps } from "@chakra-ui/react";
import React from "react";

interface IOnBoardingContentPiece extends ChakraProps {
  title: string;
  content: string;
}

const OnBoardingContentPiece: React.FC<IOnBoardingContentPiece> = ({
  title,
  content,
  ...props
}) => {
  return (
    <Box maxW={250} textAlign="center" {...props}>
      <Heading as="h3" size="md" mb={2}>
        {title}
      </Heading>
      <Text>{content}</Text>
    </Box>
  );
};

export default OnBoardingContentPiece;
