import { NextApiRequest, NextApiResponse } from "next";
import {
  Configuration,
  CountryCode,
  DepositoryAccountSubtype,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.NEXT_PUBLIC_PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.NEXT_PUBLIC_PLAID_SECRET,
    },
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = new PlaidApi(configuration);

  await client
    .linkTokenCreate({
      user: {
        client_user_id: "123-test-user-id",
      },
      client_name: "Plaid Test App",
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      webhook: process.env.NEXT_PUBLIC_PLAID_HOOK,
      account_filters: {
        depository: {
          account_subtypes: [
            DepositoryAccountSubtype.Checking,
            DepositoryAccountSubtype.Savings,
          ],
        },
      },
    })
    .then((response) => {
      res.status(200).json({ link_token: response.data.link_token });
    })
    .catch((error) => {
      console.log(`create link token failed: ${error}`);
      res.status(500).json({ error: error });
    });
}
