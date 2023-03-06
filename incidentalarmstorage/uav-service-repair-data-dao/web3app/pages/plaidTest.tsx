import { useEffect } from "react";

import Link from "../components/PlaidLink";

import useMutationCreateToken from "~~/hooks/useMutationCreateToken";

export default function Home() {
  const { data, mutate } = useMutationCreateToken({});
  const linkToken = data?.data?.link_token || null;
  useEffect(() => {
    mutate();
  }, [mutate]);
  return linkToken != null ? <Link linkToken={linkToken} /> : <></>;
}
