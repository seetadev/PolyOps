import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";
import { erc20ABI } from "wagmi";

export default defineConfig({
  out: "generated/wagmiTypes.ts",
  contracts: [
    {
      name: "erc20",
      abi: erc20ABI,
    },
  ],
  plugins: [
    hardhat({
      project: "../core",
      artifacts: "../core/artifacts",
      commands: {
        clean: "npm run hardhat clean",
        build: "npm run hardhat compile",
        rebuild: "npm run hardhat compile",
      },
    }),
    react(),
  ],
});
