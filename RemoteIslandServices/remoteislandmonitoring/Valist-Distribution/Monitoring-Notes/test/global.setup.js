import path from 'path';
import { Nuxt, Builder } from 'nuxt';
import nuxtConfig from '../nuxt.config';

// these boolean switches turn off the build for all but the store
const resetConfig = {
  loading: false,
  loadingIndicator: false,
  fetch: {
    client: false,
    server: false
  },
  features: {
    store: true,
    layouts: false,
    meta: false,
    middleware: false,
    transitions: false,
    deprecations: false,
    validate: false,
    asyncData: false,
    fetch: false,
    clientOnline: false,
    clientPrefetch: false,
    clientUseUrl: false,
    componentAliases: false,
    componentClientOnly: false
  },
  build: {
    indicator: false,
    terser: false
  }
};

// we take our nuxt config, lay the resets on top of it,
// and lastly we apply the non-boolean overrides
const config = Object.assign({}, nuxtConfig, resetConfig, {
  ignore: ['**/components/**/*', '**/layouts/**/*', '**/pages/**/*'],
  rootDir: path.join(__dirname, '../')
});

const buildNuxt = async () => {
  const nuxt = new Nuxt(config);
  await new Builder(nuxt).build();
  return nuxt;
};

module.exports = async () => {
  const nuxt = await buildNuxt();

  // we surface this path as an env var now 
  // so we can import the store dynamically later on
  process.env.buildDir = nuxt.options.buildDir;
};
