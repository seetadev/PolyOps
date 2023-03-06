import axios, { AxiosError, AxiosResponse } from "axios";
import { useMutation } from "react-query";

interface CreateLinkResponse {
  link_token: string;
}

const useMutationSetAccessToken = (
  options: Parameters<typeof useMutation>[2]
) =>
  useMutation<AxiosResponse, AxiosError, string>(
    ["set-access-token"],
    (public_token) => axios.post("/api/set_access_token", { public_token }),
    options
  );

export default useMutationSetAccessToken;
