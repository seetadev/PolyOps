<template>
  <NFT />
</template>

<script>
import NFT from "./components/NFT.vue";

export default {
  name: "App",
  components: {
    NFT,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
