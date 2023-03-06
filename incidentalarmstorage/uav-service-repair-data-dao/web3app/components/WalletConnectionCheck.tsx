import { WarningTwoIcon } from "@chakra-ui/icons";
import { Box, Button } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ComponentProps } from "react";

interface WalletConnectionCheckProps {
  notConnectedProps?: ComponentProps<typeof Button>;
  notConnectedContent?: React.ReactNode;
  unsupportedProps?: ComponentProps<typeof Button>;
  unsupportedContent?: React.ReactNode;
  children: React.ReactNode;
}

const WalletConnectionCheck = ({
  notConnectedProps,
  notConnectedContent = "Connect Wallet",
  unsupportedProps,
  unsupportedContent = "Wrong network",
  children,
}: WalletConnectionCheckProps) => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        return (
          <Box
            h="full"
            w="full"
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    variant="ghost"
                    sx={{
                      width: "100%",
                      height: "100%",
                      minH: 10,
                    }}
                    {...notConnectedProps}
                  >
                    {notConnectedContent}
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    colorScheme="red"
                    variant="ghost"
                    leftIcon={<WarningTwoIcon />}
                    sx={{
                      width: "100%",
                      height: "100%",
                    }}
                    {...unsupportedProps}
                  >
                    {unsupportedContent}
                  </Button>
                );
              }
              return children;
            })()}
          </Box>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnectionCheck;
