# Chainlink: External Adapter example

This POC creates an External Adapter that returns 4 uint64 packed into a bytes32. This External Adapter is executed by a Job, which is triggered by an External Initiator. Finally, this Job sends a TX to a Smart Contract with the result of the External Adapter, unpacking and saving the 4 uint64.

**Note:** The following steps require some basic knowledge about the Chainlink stack: how to run a Chainlink Node, create Jobs, Bridges and External Initiators in the node, and deploy External Adapter functions. It is advisable to start by reading the [Chainlink Docs](https://docs.chain.link).

### Steps for running this POC

#### 1. Run a Chainlink node

  Reference docs: https://docs.chain.link/docs/running-a-chainlink-node

  - Within the `.chainlink-kovan` directory create a `.env` file, copy content of `.env.example` and update `ETH_URL` with your Infura PROJECT_ID

  - Run:
  ```bash
  $ docker run -p 6688:6688 -v PROJECT_PATH:/chainlink -it --env-file=.env smartcontract/chainlink local n
  ```
  (where `PROJECT_PATH` is the path to the root of this directory).

  The first time running the docker image, you will be asked for a password and confirmation. This will be your wallet password, used for unlocking the generated keystore file. Then, you will be prompted to enter an API email and password.

  The Chainlink node can be supplied with files for the wallet password and API email and password (on separate lines) on startup so that you don't need to enter credentials when starting the node. You can create an API file by running the following:

  ```bash
  echo "user@example.com" > .api
  echo "password" >> .api
  echo "my_wallet_password" > .password
  ```

  From now on, you can startup the node running the following command within the `.chainlink-kovan` directory:

  ```bash
  docker run -p 6688:6688 -v PROJECT_PATH/.chainlink-kovan:/chainlink -it --env-file=.env smartcontract/chainlink local n -p /chainlink/.password -a /chainlink/.api
  ```

#### 2. Deploy Smart contract

  - Deploy `TestPacked.sol` from `contract` directory on Kovan testnet
  - Save its address

#### 3. Deploy External Adapter function

  - Follow the steps from https://chainlinkadapters.com/guides/run-external-adapter-on-gcp for deploying the `external-adapter` as a Cloud Function in GCP.

#### 4. Create bridge for the External Adapter

  Reference docs: https://docs.chain.link/docs/node-operators

  External adapters are added to the Chainlink node by creating a bridge type. Bridges define the tasks' name and URL of the external adapter. When a task type is received, and it is not one of the core adapters, the node will search for a bridge type with that name, utilizing the bridge to your external adapter.

  **Note:** Bridge and task type names are case insensitive.

  To create a bridge on the node, you can navigate to the "Create Bridge" menu item in the GUI. From there, you will specify a Name, URL and, optionally, the number of Confirmations for the bridge.

  **Note:** Bridge Name should be unique to the local node and the Bridge URL should be the URL of your external adapter, whether local or on a separate machine.

#### 5. Deploy a External Initiator NoOp function in GCP

#### 6. Create External Initiator in chainlink node

  ```bash
  docker ps
  ```

  The output would be similar to:

  ```bash
  CONTAINER ID        IMAGE                     COMMAND                  CREATED             STATUS              PORTS                              NAMES
  436882efd51d        smartcontract/chainlink   "./chainlink-launche…"   33 minutes ago      Up 21 minutes       6688/tcp, 0.0.0.0:6688->6688/tcp   chainlink
  ```

  ```bash
  docker exec -it chainlink /bin/bash
  ```

  This changes the prompt to something similar to:

  ```bash
  root@436882efd51d:~#
  ```

  Log in by running:

  ```bash
  chainlink admin login
  ```

  Create the External Initiator with:

  ```bash
  chainlink initiators create NAME URL
  ```

  (where `NAME` is the name of the initiator and `URL` the url of the function deployed on step #5)

  The URL of an EI is so that when you create a job spec which uses that initiator, the Chainlink node will POST the spec to it so that the EI can be aware of what the Job ID is and any parameters defined in the spec.

  After running the previous command you will get something like:

  ```bash
  ╔ External Initiator Credentials:
  ╬═════════╬════════════════════════════════════════════════════════════════════╬══════════════════════════════════╬══════════════════════════════════════════════════════════════════╬══════════════════════════════════════════════════════════════════╬══════════════════════════════════════════════════════════════════╬
  ║  NAME   ║                                URL                                 ║            ACCESSKEY             ║                              SECRET                              ║                          OUTGOINGTOKEN                           ║                          OUTGOINGSECRET                          ║
  ╬═════════╬════════════════════════════════════════════════════════════════════╬══════════════════════════════════╬══════════════════════════════════════════════════════════════════╬══════════════════════════════════════════════════════════════════╬══════════════════════════════════════════════════════════════════╬
  ║ packed2 ║ https://us-central1-chainlink-258919.cloudfunctions.net/responseEI ║ 4dde7ecc776948d885f488781b5d6f3e ║ 2D8YR3qMJlMKQAn15dlHM0yht40RbxwHLdN+t0cCVHQPHw6PvoIih2uMde7SwBrW ║ DGCLy/htolu7+DgUL9fTh8mowu7DyPd6wyH6Pn1OSzPq17mOSEj4tg8x/5onp31j ║ iIb8rflQLB56tkBiKU9VusxWSBwtW1tm7bwy/RfJlrlZKnxhAkquykcr8o/57WYr ║
  ╬═════════╬════════════════════════════════════════════════════════════════════╬══════════════════════════════════╬══════════════════════════════════════════════════════════════════╬══════════════════════════════════════════════════════════════════╬══════════════════════════════════════════════════════════════════╬
  root@0bc4243c3592:~# exit
  ```

#### 7. Create job for external initiator

Create a job in the node like the following one, to be triggered by the External Initiator.

```javascript
  {
    "initiators": [
      {
        "type": "external",
        "name": "EXTERNAL_INITIATOR_NAME"
      }
    ],
    "tasks": [
      {
        "type": "BRIDGE NAME FROM STEP 4"
      },
      {
        "type": "ethtx",
        "params": {
          "address": "ADDRESS FROM STEP 2",
          "functionSelector": "unpack(bytes32)"
        }
      }
    ]
  }
```

#### 8. Install, configure and run external-initiator

```bash
cd external-initiator
yarn # or npm install
```
Create a `.env` file, copy content of `.env.example` and update `ACCESSKEY` and `SECRET` with what you got in step #6. Also, update `JOB_ID` with what you got from step #7.
```
yarn start #or npm start
```

#### 9. Check out the results

Go to etherscan and check transactions for contract deployed on step #2. You could also check public values `a`, `b`, `c` and `d` in the deployed contract, which should be different from 0.
