import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => (
  <Flex
    minH="100vh"
    direction="column"
    w="full"
    bg="#F1F4F9"
    as={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {children}
  </Flex>
);
export default PageTransition;
