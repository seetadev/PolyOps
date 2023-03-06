import { Button, ButtonProps, ChakraProps, Flex } from "@chakra-ui/react";
import { useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";

import useMutationSetAccessToken from "~~/hooks/useMutationSetAccessToken";

interface JoinDALNButtonProps extends ButtonProps {
  linkToken: string | null;
  onSuccess?: (data?: any, variables?: any, context?: any) => void;
}
export default function JoinDALNButton({
  linkToken = null,
  onClick = () => {},
  isDisabled,
  onSuccess = () => {},
  isLoading = false,
  ...props
}: JoinDALNButtonProps) {
  const { mutateAsync, isLoading: isLoadingSetAccessToken } =
    useMutationSetAccessToken({
      onSuccess(data, variables, context) {
        onSuccess(data, variables, context);
      },
      onError(error) {
        console.log(`axios.post() failed: ${error}`);
      },
    });
  const sendPublicTokenToBackend = useCallback(
    async (public_token: string, metadata: any) => {
      // send public_token to server to exchange for access_token and store in db
      await mutateAsync(public_token);
    },
    [mutateAsync]
  );

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken,
    onSuccess: sendPublicTokenToBackend,
  };
  const { open, ready } = usePlaidLink(config);
  return (
    <Flex justifyContent="center">
      <Button
        size="lg"
        maxWidth={382}
        flex={1}
        isLoading={isLoading || isLoadingSetAccessToken}
        isDisabled={!linkToken || !ready || isDisabled}
        onClick={(e) => {
          open();
          onClick && onClick(e);
        }}
        {...props}
      >
        Join DALN
      </Button>
    </Flex>
  );
}
