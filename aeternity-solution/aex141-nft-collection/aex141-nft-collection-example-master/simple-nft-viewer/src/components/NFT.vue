<template>
  <h1 v-if="metaInfo">
    {{ metaInfo.name }}
  </h1>
  <div v-for="nft in nfts" :key="nft.name" class="nft">
    <h2>{{ nft.name }}</h2>
    <h3>{{ nft.description }}</h3>
    <img :alt="nft.description" :src="nft.image_url" width="300" />
  </div>
</template>

<script>
import { AeSdk, Node } from "@aeternity/aepp-sdk";
const aex141Aci = require("../aex141Aci.json");

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export default {
  name: "NFT",
  data() {
    return {
      metaInfo: null,
      nfts: [],
    };
  },
  methods: {
    initSdk() {
      return new AeSdk({
        compilerUrl: "https://compiler.aeternity.io",
        nodes: [
          {
            name: "ae_uat",
            instance: new Node("https://testnet.aeternity.io"),
          },
        ],
      });
    },
    async initContract() {
      const aeSdk = this.initSdk();
      const contract = await aeSdk.getContractInstance({
        aci: aex141Aci,
        contractAddress:
          "ct_2QTanakTwkp2p68n3aR296iE2ad4tHH3ov8kRy8ySF4xQuunM8",
      });

      this.metaInfo = await contract.methods
        .meta_info()
        .then((res) => res.decodedResult);

      this.nfts = await Promise.all(
        [...new Array(8)].map(async (_, i) => {
          const { decodedResult: metadata } = await contract.methods.metadata(
            i + 1
          );
          const nft_immutable_metadata = await (
            await fetch(
              metadata["MetadataMap"][0]
                .get("url")
                .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/") // load json with immutable metadata via cloudflare ipfs gateway
            )
          ).json();

          await sleep(500); // to avoid http error 429 on cloudflare

          return {
            name: nft_immutable_metadata.name,
            description: nft_immutable_metadata.description,
            image_url: nft_immutable_metadata.media_url.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/" // use default ipfs gateway to display images
            ),
          };
        })
      );
    },
  },
  mounted() {
    this.initContract();
  },
};
</script>

<style scoped>
.nft {
  margin: 4rem 0;
}
</style>
