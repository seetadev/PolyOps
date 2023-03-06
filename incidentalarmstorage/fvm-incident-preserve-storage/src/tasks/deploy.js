
const { task, types } = require("hardhat/config")
const ethers = require("ethers")
const util = require("util")
const request = util.promisify(require("request"))
const DEPLOYER_PRIVATE_KEY = "032c6bdae6cc5408b0362b1eac35bf2f373bda66f005d15fa20bdc412e41b1c8";

task("deploy:membershipnft", "Deploy Membership NFT Contract")
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ( { logs }, { ethers }) => {
        console.log("Deploying Membership NFT Contract")

        const priorityFee = await callRpc("eth_maxPriorityFeePerGas")

        async function callRpc(method, params) {
            var options = {
              method: "POST",
              url: " https://wss.hyperspace.node.glif.io/apigw/lotus/rpc/v1",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: method,
                params: params,
                id: 1,
              }),
            };
            const res = await request(options);
            return JSON.parse(res.body).result;
        }

        const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY)
        console.log("Deployer's Address : ", deployer.address);

        const membershipNFT = await ethers.getContractFactory("GuildMembershipNFT")
    
            const membershipNFTContract = await membershipNFT.deploy({
                gasLimit: 1000000000,
                maxPriorityFeePerGas: priorityFee
            })
    
            await membershipNFTContract.deployed()
    
            if (logs) {
                console.info(`GuildMembershipNFT contract has been deployed to: ${membershipNFTContract.address}`)
            }

            return membershipNFTContract

    })

task("deploy", "Deploy DataGuild contract")
    .addOptionalParam("admins", "List of Admins separated by comma(,)")
    .addOptionalParam("membershipnftaddress", "Membership NFT contract address", undefined, types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ( { admins, membershipnftaddress, logs }, { ethers }) => {
        
        var adminsList = []
        let accounts = admins.split(',');

        for (let i = 0; i < accounts.length; i++) {
            adminsList.push(accounts[i])
        };

        const priorityFee = await callRpc("eth_maxPriorityFeePerGas")

        async function callRpc(method, params) {
            var options = {
              method: "POST",
              url: " https://wss.hyperspace.node.glif.io/apigw/lotus/rpc/v1",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: method,
                params: params,
                id: 1,
              }),
            };
            const res = await request(options);
            return JSON.parse(res.body).result;
        }

        const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY)
        console.log("Deployer's Address : ", deployer.address);

        if (!membershipnftaddress) {
            var { address: membershipnftaddress } = await run("deploy:membershipnft", { logs })
            membershipnftaddress = membershipnftaddress;
        }

            console.log("Deploying DataGuild Contract")

            const dataGuild = await ethers.getContractFactory("DataGuild")

            const dataGuildContract = await dataGuild.deploy(adminsList, membershipnftaddress, {
                gasLimit: 1000000000,
                maxPriorityFeePerGas: priorityFee
            })
    
            await dataGuildContract.deployed()

            if (logs) {
                console.info(`DataGuild contract has been deployed to: ${dataGuildContract.address}`)
            }

            return dataGuildContract

    })

    // rk@Rishikeshs-MacBook-Air src % npx hardhat deploy:membershipnft
    // Deploying Membership NFT Contract
    // Deployer's Address :  0x5309d110C6ff50D28563006Ff6C3e2a06b757ae1
    // GuildMembershipNFT contract has been deployed to: 0x968425a4067231256C0959A285D0e602b881ed02
    // rk@Rishikeshs-MacBook-Air src % npx hardhat deploy --admins 0x5309d110C6ff50D28563006Ff6C3e2a06b757ae1 --membershipnftaddress 0x968425a4067231256C0959A285D0e602b881ed02
    // Deployer's Address :  0x5309d110C6ff50D28563006Ff6C3e2a06b757ae1
    // Deploying DataGuild Contract
    // DataGuild contract has been deployed to: 0x4fC813a466FDeD08175Be0c1B577F95d7fBA8dd8