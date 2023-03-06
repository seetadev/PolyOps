require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("hardhat-deploy-ethers")
require("./tasks/deploy") // Your deploy task.

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.17",
    defaultNetwork: "hyperspace",
    networks: {
        hyperspace: {
            chainId: 3141,
            url: " https://wss.hyperspace.node.glif.io/apigw/lotus/rpc/v1",
            accounts: ["032c6bdae6cc5408b0362b1eac35bf2f373bda66f005d15fa20bdc412e41b1c8"],
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
}