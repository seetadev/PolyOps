import { Center } from "@chakra-ui/react";

import OnBoardingCard from "./OnBoardingCard";

interface CenteredCardProps {
  children: React.ReactNode;
  prependedContent?: React.ReactNode;
  appendedContent?: React.ReactNode;
}

const CenteredCard = ({
  children,
  prependedContent,
  appendedContent,
}: CenteredCardProps) => {
  return (
    <>
      <Center
        sx={{
          flex: 1,
        }}
      >
        <OnBoardingCard
          appendedContent={appendedContent}
          prependedContent={prependedContent}
        >
          {children}
        </OnBoardingCard>
      </Center>
    </>
  );
};

export default CenteredCard;
