const axios = require('axios').default;
const { generateKeyPair} = require('@aeternity/aepp-sdk');

const run = async () => {
    const keypair = generateKeyPair()
    console.log(`Secret key: ${keypair.secretKey}`)
    console.log(`Public key: ${keypair.publicKey}`)
    
    await axios.post(`https://faucet.aepps.com/account/${keypair.publicKey}`);
    const accountResponse = await axios.get(`https://testnet.aeternity.io/v3/accounts/${keypair.publicKey}`);
    
    console.log(`Balance: ${accountResponse.data.balance} ættos`);
}

run();