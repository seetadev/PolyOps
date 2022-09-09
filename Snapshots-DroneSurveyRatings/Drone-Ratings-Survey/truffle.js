var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "enemy knee ivory diagram tobacco slow document gentle ahead industry hope space";
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
     ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/8a35dd167e2e4c40bc0779df1173868d");
      },
      network_id: "*",
      gas: 4000000
    }
  }
};
