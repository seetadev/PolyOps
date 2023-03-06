import axios from "axios";
import React from "react";
import { usePlaidLink } from "react-plaid-link";

interface LinkProps {
  linkToken: string | null;
}
const Link: React.FC<LinkProps> = (props: LinkProps) => {
  const onSuccess = React.useCallback(
    async (public_token: string, metadata: any) => {
      // send public_token to server to exchange for access_token and store in db
      await axios
        .post("/api/set_access_token", { public_token })
        .catch((error) => {
          console.log(`axios.post() failed: ${error}`);
        });
    },
    []
  );

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken,
    onSuccess: onSuccess,
  };
  const { open, ready } = usePlaidLink(config);
  return (
    <button
      onClick={() => {
        open();
      }}
      disabled={!ready}
    >
      Link account
    </button>
  );
};

export default Link;
