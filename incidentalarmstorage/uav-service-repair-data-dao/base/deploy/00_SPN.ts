import { DeployFunction } from "hardhat-deploy/types";

import { THardhatRuntimeEnvironmentExtended } from "~/helpers/types/THardhatRuntimeEnvironmentExtended";

const func: DeployFunction = async (
  hre: THardhatRuntimeEnvironmentExtended
) => {
  const { getUnnamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const [deployer] = await getUnnamedAccounts();
  await deploy("SPN_Factory", {
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ["SPN_Factory"];
