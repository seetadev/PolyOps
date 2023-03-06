import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

async function setToken(userId: string, token: string, itemId: string) {
  const url = `mongodb+srv://admin:${process.env.DB_PASSWORD}@spndao.vjnl9b2.mongodb.net/?retryWrites=true&w=majority`;
  const dbClient = new MongoClient(url);
  const dbName = "spndao";
  await dbClient.connect();

  const db = dbClient.db(dbName);
  const collection = db.collection("users");

  await collection.insertOne({
    name: userId,
    plaid_access_token: token,
    plaid_item_id: itemId,
  });
}

interface SetTokenProps extends NextApiRequest {
  body: {
    public_token: string;
  };
}

export default async function handler(
  req: SetTokenProps,
  res: NextApiResponse
) {
  const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.NEXT_PUBLIC_PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.NEXT_PUBLIC_PLAID_SECRET,
      },
    },
  });

  const client = new PlaidApi(configuration);

  await client
    .itemPublicTokenExchange({
      public_token: req.body.public_token,
    })
    .then(async (response) => {
      await setToken(
        "abc",
        response.data.access_token,
        response.data.item_id
      ).catch((error) => {
        console.log(`setToken() failed: ${error}`);
        res.status(500).json({ error: error });
      });

      // init the tx sync
      await client
        .transactionsSync({
          access_token: response.data.access_token,
        })
        .catch((error) => {
          console.log(`transactionsSync() failed: ${error}`);
          res.status(500).json({ error: error });
        });
    })
    .catch((error) => {
      console.log(`exchange public token failed: ${error}`);
      console.log(`public_token: ${req.body.public_token}`);
      res.status(500).json({ error: error });
    })
    .finally(() => {
      res.status(200).json({ success: true });
    });
}
