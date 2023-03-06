import axios, { AxiosResponse } from "axios";
import { useMutation } from "react-query";

interface CreateLinkResponse {
  link_token: string;
}

const useMutationCreateToken = (options: Parameters<typeof useMutation>[2]) =>
  useMutation<AxiosResponse<CreateLinkResponse>>(
    ["create-token"],
    () => axios.post("/api/create_link_token"),
    options
  );

export default useMutationCreateToken;
