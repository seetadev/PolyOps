import { ethers } from "hardhat";

void async function main() {
  const SPN = await ethers.getContractFactory("SPN");
  const spn = await SPN.deploy();

  await spn.deployed();

  console.log(`SPN deployed to ${spn.address}`);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
