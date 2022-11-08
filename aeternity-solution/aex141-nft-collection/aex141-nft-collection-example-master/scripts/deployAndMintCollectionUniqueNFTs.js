const { AeSdk, MemoryAccount, Node, getAddressFromPriv} = require('@aeternity/aepp-sdk');
const { utils } = require('@aeternity/aeproject');

const shutdown = (varName) => {
    console.error(`Missing ENV variable: ${varName}`);
    process.exit(1);
}

const NODE_URL = 'https://testnet.aeternity.io';
const COMPILER_URL = 'https://compiler.aeternity.io';

const collectionUniqueMetadata = require('../nfts/collection_unique_nfts.json');

(async function () {
    secretKey = process.env.SECRET_KEY
    if(!secretKey) {
        shutdown('SECRET_KEY')
    }
    const senderAccount = new MemoryAccount({
        keypair: {
            secretKey,
            publicKey: getAddressFromPriv(secretKey)
        }
    });
    const senderAddress = await senderAccount.address();

    console.log(`Deploying with account: ${senderAddress}`);

    const node = new Node(NODE_URL);
    const aeSdk = new AeSdk({
        compilerUrl: COMPILER_URL,
        nodes: [{ name: 'testnet', instance: node }],
    });
    await aeSdk.addAccount(senderAccount, { select: true });

    const CONTRACT = './contracts/CollectionUniqueNFTs.aes';
    const source = utils.getContractContent(CONTRACT);
    const fileSystem = utils.getFilesystem(CONTRACT);

    const contract = await aeSdk.getContractInstance({ source, fileSystem });

    // deploy
    await contract.deploy([
        collectionUniqueMetadata.name,
        collectionUniqueMetadata.symbol,
        8
    ]);
    console.log(`Contract successfully deployed!`);
    console.log(`Contract address: ${contract.deployInfo.address}`);
    console.log(`Tx-Hash: ${contract.deployInfo.txData.hash}`);
    console.log(`Gas used: ${contract.deployInfo.result.gasUsed}`);
    console.log(`------------------------------------------------------------------------------------------`);
    console.log(`------------------------------------------------------------------------------------------`);

    const metadataMapAllNFTs = new Array();
    for(let i=0; i<collectionUniqueMetadata.immutable_metadata_urls.length; i++) {
      metadataMapAllNFTs.push(new Map([['url', collectionUniqueMetadata.immutable_metadata_urls[i]]]))
    }

    // define nonce individually
    let nonce = (await aeSdk.api.getAccountNextNonce(senderAddress)).nextNonce
    // mint all nfts
    for(let i=0; i<collectionUniqueMetadata.immutable_metadata_urls.length; i++) {
      const mintTx = await contract.methods.mint(senderAddress, {'MetadataMap': [metadataMapAllNFTs[i]]}, undefined, { nonce });
      console.log(`Using nonce: ${nonce}`);
      console.log(`Minted NFT with id '${mintTx.decodedResult}'`);
      console.log(`Tx-Hash: ${mintTx.hash}`);
      console.log(`Gas used: ${mintTx.result.gasUsed}`);
      console.log(`------------------------------------------------------------------------------------------`);
      console.log(`------------------------------------------------------------------------------------------`);
      nonce++;
    }
})()
