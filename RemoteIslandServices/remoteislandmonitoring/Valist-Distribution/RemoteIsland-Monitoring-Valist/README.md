# Create React App Example

This example demonstrates how to publish your Create React App on Valist.

[Click here to view this project on Valist.](https://mumbai.valist.io/nasdf/example-create-react-app)

## Setup

Edit your `package.json` to use relative paths.

```json
{
  "homepage": "."
}
```

## Publish with the Valist GitHub Action

See the [GitHub Action Quick Start](https://docs.valist.io/github-action/github-action-quick-start) for more info.

```yaml
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - uses: actions/checkout@v2
      - run: |
          npm install
          npm run build
      - uses: valist-io/valist-github-action@v2.3.0
        with:
          private-key: ${{ secrets.PRIVATE_KEY }}
          account: <your-account-name-here>
          project: <your-project-name-here>
          release: ${{ github.ref_name }}
          path: './build'
```

## Publish with the Valist CLI

See the [CLI Quick Start](https://docs.valist.io/cli/cli-quick-start) for more info.

### Simple

Run the following from your project root.

```bash
$ npm run build
$ valist publish <your-account-name-here>/<your-project-name-here>/<your-release-name-here> ./build
```

### Advanced

Create a `valist.yml` file in your project root.

```yaml
account: <your-account-name-here>
project: <your-project-name-here>
release: <your-release-name-here>
path: ./build
```

Run the following from your project root.

```bash
$ npm run build
$ valist publish
```
