import { keyframes, Progress } from "@chakra-ui/react";

const delayedFadeIn = keyframes`
  from {opacity: 0}
  to {opacity: 1}
`;
const DelayedProgressBar = () => (
  <Progress
    size="xs"
    isIndeterminate
    sx={{
      animation: `${delayedFadeIn} 3s ease-in-out`,
    }}
  />
);

export default DelayedProgressBar;
