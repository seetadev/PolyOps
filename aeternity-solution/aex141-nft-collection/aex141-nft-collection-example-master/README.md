# aex141-nft-collection-example [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/aeternity/aex141-nft-collection-example)


This repository will guide you through all the steps required to create an NFT collection and NFTs on the æternity blockchain using the [AEX-141](https://github.com/aeternity/AEXs/blob/master/AEXS/aex-141.md) standard.

It demonstrates two different use cases:
- Unique NFTs (e.g. for unique artworks)
- Edition NFTs using templates (e.g. for gaming)

## Immutable Metadata on IPFS
The immutable metadata of the following example collections is stored on IPFS and referenced in the NFT contract. This way we avoid spamming the chain with unnecessary data while embracing decentralization.

<details>
    <summary><b>Read more...</b></summary>

### Considerations
In case you plan to launch a collection your should consider taking actions in following order:

1. Upload media file to IPFS
1. Create JSON file with immutable metadata which includes the reference to the media file on IPFS
   - e.g. `"media_url": "ipfs://QmV8zLF5zBSiKU9go9GXkeCZXeHp7iZQMzpBxnU5eGHSZT"`
1. Upload JSON file with immutable metadata on IPFS
1. Deploy the NFT contract
1. Mint the NFTs which includes the reference to the JSON file on IPFS that contains immutable metadata

This will be demonstrated and explained step by step if you continue reading.

### Example collection: Apes stepping into the Metaverse

For this example we used [DALL-E 2](https://openai.com/dall-e-2) to generate some images based on the text `apes stepping into the metaverse`.

The images have been uploaded and pinned using [Pinata](https://www.pinata.cloud) where you can pin up to 1GB of media for free.

The NFT images of the example collection are stored under [nfts/images](./nfts/images) and their filename reflect the IPFS hash which is used in the `media_url` in the immutable metadata of each NFT ;-)

**Note**:

- If the media isn't pinned anymore and nobody saved the original file the NFT media cannot be fetched anymore.
- When creating NFT collections you (or your community) should ensure that the media is always pinned on IPFS (or other decentralized storage alternatives) either by yourself or by some 3rd party service you typicall have to pay for.
- The IPFS hash will always be the same as long as somebody owning the original media has it stored somewhere, uploads and pins at again on IPFS.

### NFT metadata - overview

| NFT name | File | IPFS hash
| --- | --- | --- |
| Walking on the ladder | [1.json](./nfts/immutable-metadata/1.json) | [QmdXfW9PuiUi6rToxmFMxaiY3Umn6SKGygihhk2oUj1PDu](https://ipfs.io/ipfs/QmdXfW9PuiUi6rToxmFMxaiY3Umn6SKGygihhk2oUj1PDu) |
| The path to heaven | [2.json](./nfts/immutable-metadata/2.json) | [QmQCctL2rnAHvhKNRAFg5iHbtkWcDA1GE1YeacgkWnnxbX](https://ipfs.io/ipfs/QmQCctL2rnAHvhKNRAFg5iHbtkWcDA1GE1YeacgkWnnxbX) |
| Still sitting in the jungle | [3.json](./nfts/immutable-metadata/3.json) | [QmYmQtJR3WHdspFmzUThpKw6WbbuPc5oprPB6fGxsvjmBa](https://ipfs.io/ipfs/QmYmQtJR3WHdspFmzUThpKw6WbbuPc5oprPB6fGxsvjmBa) |
| We almost made it! | [4.json](./nfts/immutable-metadata/4.json) | [QmX8q5hHW6kB7N12YyttfdiBBdQAZ6sjkVbzQa7kRo6Qnn](https://ipfs.io/ipfs/QmX8q5hHW6kB7N12YyttfdiBBdQAZ6sjkVbzQa7kRo6Qnn) |
| I'm in! | [5.json](./nfts/immutable-metadata/5.json) | [QmfMnhj3LoTbYjSfsvbtabHK4CV4zL29E4DpaYPoxkhUnx](https://ipfs.io/ipfs/QmfMnhj3LoTbYjSfsvbtabHK4CV4zL29E4DpaYPoxkhUnx) |
| Utopia is there! | [6.json](./nfts/immutable-metadata/6.json) | [QmajFQ7Q9XrZgqi54vacv3ya2AATyAQ7Bw9wCazYYtWGyJ](https://ipfs.io/ipfs/QmajFQ7Q9XrZgqi54vacv3ya2AATyAQ7Bw9wCazYYtWGyJ) |
| Waiting for my homies! | [7.json](./nfts/immutable-metadata/7.json) | [QmbMuA5vaebD1jzTkSiaTrHxnQ2H8keY76dguS3ANmuShs](https://ipfs.io/ipfs/QmbMuA5vaebD1jzTkSiaTrHxnQ2H8keY76dguS3ANmuShs) |
| There is no way back! | [8.json](./nfts/immutable-metadata/8.json) | [QmdZ6JFCGdQQUEuyeMU7S7Hb929QFt1BgUcZmYg6nEd4E1](https://ipfs.io/ipfs/QmdZ6JFCGdQQUEuyeMU7S7Hb929QFt1BgUcZmYg6nEd4E1) |

### NFT metadata - schema
We're proposing following schema for the immutable metadata referenced in the NFT:

- `name` the name of the NFT
- `description` the description of the NFT
- `media_type` the media type of the NFT
    - e.g. `NONE`, `IMAGE`, `AUDIO`, `VIDEO`, `3D_GLB`, `PDF`, ... (ideally this is defined based on discussions within the community)
- `media_url`
    - e.g. `ipfs://`, `ar://`
    - we recommend to **AVOID** using centralized URLs as this property should be immutable
- `traits`
    - a JSON string representing `map<string, object>` so that basically everything is possible to be represented here

Example:
```json
{
    "name": "Walking on the ladder",
    "description": "They are escaping from earth and stepping into the metaverse!",
    "media_type": "IMAGE",
    "media_url": "ipfs://QmfCr586aHFVk6p2WhTC1Kvcaps24Mtny2CLB5bsTT9MvZ",
    "traits": {
        "apes_count": 2,
        "moon_visible": true
    }
}
```

</details>

## Example 1 - Collection with unique NFTs

The first example demonstrates how a collection that includes only unique NFTs could look like.

<details>
    <summary><b>Read more...</b></summary>

### Contract

The following contract is used for showcasing unique NFTs:
- [CollectionUniqueNFTs.aes](./contracts/CollectionUniqueNFTs.aes)

### Extensions

This example demonstrates the usage of following extensions:
- `mintable`
    - allows the owner/creator of the NFT contract to mint new NFTs
- `mintable_limit`
    - defines a limit/cap of NFTs that can be minted in the NFT contract which can only be decreased afterwards
- `burnable`
    - allows the owner (or approved account) to burn an NFT

### Dealing with metadata

The [AEX-141](https://github.com/aeternity/AEXs/blob/master/AEXS/aex-141.md) standard is aiming to be very flexible when it comes to dealing with metadata.

#### Contract level: `meta_info`

The `meta_info` specifies general info about the NFT collection:

- `name` the name of the collection
- `symbol` the symbol of the collection
- `base_url` the base-url, in case you want to use the metadata_type `URL` for the collection
    - this property is optional and irrelevant for this example
- `metadata_type` the metadata type to use
    - one of `URL`, `OBJECT_ID`, `MAP`
    - this example demonstrates the usage of `MAP`

#### Usage of `metadata_type`
This example provides the first proposal how to deal with metadata for collections with unique NFTs only and uses the metadata_type `MAP` specified in AEX-141. Following key is used in this example:

- `url` pointing to the place where the JSON file with the immutable metadata is stored
    - e.g. `ipfs://QmdXfW9PuiUi6rToxmFMxaiY3Umn6SKGygihhk2oUj1PDu`

Potentially you can add many more custom key-value pairs if needed. E.g. there is also a `mutable_attributes` extension (see example for Edition NFT Collection below) where the key `mutable_attributes` is used to store additional (upgradeable) data for an NFT.

</details>

## Example 2 - Collection with Template Edition NFTs
The second example demonstrates how a collection of edition NFTs based on templates look like. This is especially interesting for gaming projects where you want to re-use immutable metadata for a specific type of NFT and still have the flexibility to attach mutable attributes to every single NFT.

<details>
    <summary><b>Read more...</b></summary>

### Contract

The following contract is used for showcasing editon size NFTs with templates:
- [CollectionTemplateEditionNFTs.aes](./contracts/CollectionTemplateEditionNFTs.aes)

### Extensions

This example demonstrates the usage of following extensions:
- `mintable_templates` - allows the owner/creator of the NFT contract to
    - create new templates by providing
        - immutable metadata
        - an edition limit (optional) which can only be decreased afterwards
    - delete templates if no NFT has been minted based on it
    - mint NFTs based on templates
- `mintable_templates_limit` - defines a limit/cap for templates that can be created in the NFT contract
- `mutable_attributes` - allows the owner/creator of the NFT contract to update mutable attributes for NFTs in the collection
- `burnable` - allows the owner (or approved account) to burn an NFT

### Dealing with metadata

The [AEX-141](https://github.com/aeternity/AEXs/blob/master/AEXS/aex-141.md) standard is aiming to be very flexible when it comes to dealing with metadata.

#### Contract level: `meta_info`

The `meta_info` specifies general info about the NFT collection:

- `name` the name of the collection
- `symbol` the symbol of the collection
- `base_url` the base-url, in case you want to use the metadata_type `URL` for the collection
    - this property is optional and irrelevant for this example
- `metadata_type` the metadata type to use
    - one of `URL`, `OBJECT_ID`, `MAP`
    - this example demonstrates the usage of `MAP`

#### Usage of `metadata_type`
This example provides the first proposal how to deal with metadata for collections with unique NFTs only and uses the metadata_type `MAP` specified in AEX-141. Following keys are used in this example:

- `template_id` defines the template the NFT is based on
    - the template has to be created before
    - the template includes following properties:
        - `immutable_metadata` in case of this example we use `MetadataIdentifier` (URL) pointing to the place where the JSON file with the immutable metadata is stored
            - e.g. `ipfs://QmdXfW9PuiUi6rToxmFMxaiY3Umn6SKGygihhk2oUj1PDu`
        - `edition_limit` the max amount of NFTs that can be minted using the template (MUST be > 0)
        - `edition_supply` the number of NFTs that have already been minted using the template
            - this value is incremented on each new NFT mint
- `edition_serial` defines the serial no of the minted NFT within a specific template

After mint:
- `mutable_attributes` can be added and updated in form of a JSON string

**Note:**
- You can of course also implement a custom `template_mint_mutable` entrypoint where you can pass mutable attributes directly on minting if required.
- In case you prefer having immutable data on-chain you can use `MetadataMap` (MAP) as metadata for templates. We generally recommend to store the data off-chain like showcased in this example using `MetadataIdentifier (URL)

</details>

## Deployment & Minting

With the following example scripts you can easily test deployment on the official testnet. For mainnet almost identical steps can be executed. Of course you need some Æ to cover the transaction fees.

<details>
    <summary><b>Read more...</b></summary>

### Create keypair and get some Æ on testnet
Check out the quick start guide to learn how to create a keypair and how to fund your account:

- https://docs.aeternity.com/aepp-sdk-js/latest/quick-start/

Alternatively just execute the [createKeypairAndFundAccount.js](./scripts/createKeypairAndFundAccount.js) script as follows:

`node ./scripts/createKeypairAndFundAccount.js`

It will print the following output to the console:

```
Secret key: sure ;-)
Public key: ak_QVSUoGrJ31CVxWpvgvwQ7PUPFgnvWQouUgsDBVoGjuT7hjQYW
Balance: 5000000000000000000 ættos
```

### Deploy & Mint Collection with unique NFTs

The [deployAndMintCollectionUniqueNFTs.js](./scripts/deployAndMintCollectionUniqueNFTs.js) script demonstrates how you can use the SDK programmatically to deploy and mint your NFTs on the testnet. If you run the following command, the contract will be deployed and the NFTs will be minted according to the data defined in [collection_unique_nfts.json](./nfts/collection_unique_nfts.json):

`SECRET_KEY=<your_secret_key> node ./scripts/deployAndMintCollectionUniqueNFTs.js`

Alternatively you can set the env variable `SECRET_KEY` in your terminal and just run `node ./scripts/deployAndMintCollectionUniqueNFTs.js`.

<details>
    <summary>Show console output</summary>

```sh
Deploying with account: ak_8Ujt76QfpT1DyYsNZKGPGtMZ2C2MFf7CcnpQvJWNsX6szZkYN
==> Adding include to filesystem: ./core/utils.aes
==> Adding include to filesystem: ./core/IAEX141NFTReceiver.aes
Contract successfully deployed!
Contract address: ct_2QTanakTwkp2p68n3aR296iE2ad4tHH3ov8kRy8ySF4xQuunM8
Tx-Hash: th_4rNhmN2PwTKdPvgVJ4hsaigjSJoYd9Et9o1Rbz1R2V7dR2naZ
Gas used: 2821
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 244
Minted NFT with id '1'
Tx-Hash: th_XKPPEAtAuM8RFaZaQXssqfa2yjN6SuBwYxXciraSSPcgPhGK9
Gas used: 19552
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 245
Minted NFT with id '2'
Tx-Hash: th_26Vq5MULJLQD54k3sTFtjSe9TpnAofUbyyyVawDCxo8VQCA8dk
Gas used: 20141
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 246
Minted NFT with id '3'
Tx-Hash: th_26vmPV7bnHVzX1yAdJZANFyEgiZZGPAozJzTU9ALn5j9DWuJU9
Gas used: 20013
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 247
Minted NFT with id '4'
Tx-Hash: th_bRr9nURDa4fK2E85TVGFLdQ4D7iZuLTSdkQGBFYr9YUX4nnMa
Gas used: 19643
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 248
Minted NFT with id '5'
Tx-Hash: th_TRc9HTqxKuFBFfPWmWrpgr4UgrWvmdYdaFtpCMNWqXvZNcMP3
Gas used: 19656
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 249
Minted NFT with id '6'
Tx-Hash: th_2dqqahEsY3dAKcMog6xrcRdY4dToGAtP6UyiSxHk5Ckh2UC7gH
Gas used: 19669
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 250
Minted NFT with id '7'
Tx-Hash: th_wwD6P18Pc1PWX85Qxa8afQunQ8tYbwzhNbwCq3s6AP7YADM2L
Gas used: 19682
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 251
Minted NFT with id '8'
Tx-Hash: th_MigEKnRR5mTNjQrQ7MukGmcbBEdtHdmf6cEU1ms2mipqzYVeB
Gas used: 19695
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
```
</details>

### Deploy & Mint Collection with edition size NFTs (Templates)

The [deployAndMintCollectionTemplateEditionNFTs.js](./scripts/deployAndMintCollectionTemplateEditionNFTs.js) script demonstrates how you can use the SDK programmatically to deploy and mint your NFTs on the testnet. If you run the following command, the contract will be deployed, templates will be created and all the NFTs will be minted according to the data defined in [collection_templates.json](./nfts/collection_templates.json):

`SECRET_KEY=<your_secret_key> node ./scripts/deployAndMintCollectionTemplateEditionNFTs.js`

Alternatively you can set the env variable `SECRET_KEY` in your terminal and just run `node ./scripts/deployAndMintCollectionTemplateEditionNFTs.js`.

<details>
    <summary>Show console output</summary>

```sh
Deploying with account: ak_8Ujt76QfpT1DyYsNZKGPGtMZ2C2MFf7CcnpQvJWNsX6szZkYN
==> Adding include to filesystem: ./core/utils.aes
==> Adding include to filesystem: ./core/IAEX141NFTReceiver.aes
Contract successfully deployed!
Contract address: ct_2oq4kSd4j1VkkbupueXLdHwYEJdY8Ntzvp1FFkMB1gYyXkYPcV
Tx-Hash: th_9FnZLqfbwKddtJgnnE1e61hNYrcjUcHFYH5QsZBEXBHpx3UWY
Gas used: 2980
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 253
Created template with id '1'
Tx-Hash: th_KsfMGhkVf2n5RLY5qh1Bo8HppudiQREq7LMKAYuauLSuYKg4s
Gas used: 16414
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 254
Minted NFT with id '1' of template with id '1'
Tx-Hash: th_28qfRHx2ZQSDWzmAD3RugA1W4GNGCotbxCNpVKYnf8XQQ2ibGs
Gas used: 20931
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 255
Created template with id '2'
Tx-Hash: th_Vrk8UGyUpgnvVPK3TknudxPx3Jd3mSCUPnfqcuKbjWZSZivjQ
Gas used: 16818
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 256
Minted NFT with id '2' of template with id '2'
Tx-Hash: th_waWuVxDvUtqu5GECd9b3yeBjdh9JXoUhTuUt6QNNLbYWrrdHh
Gas used: 21381
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 257
Minted NFT with id '3' of template with id '2'
Tx-Hash: th_2hbQt2YJALH9bqJs3vTMW6UhixJZKp6PdWXj3V8DSC45ANato5
Gas used: 21854
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 258
Created template with id '3'
Tx-Hash: th_b3DY71PvbLj8ZC2XqL43qWaB23kugLid76B8dHGxCKuLQUutq
Gas used: 16491
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 259
Minted NFT with id '4' of template with id '3'
Tx-Hash: th_oXSkPorJsDzoBiJJNQ38TAaUAUvqS1msrZcvBb3JHxJuPFRmc
Gas used: 21050
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 260
Minted NFT with id '5' of template with id '3'
Tx-Hash: th_2SaGtb7HpLq5VY8oj7yyTijjpY1vsVkSFMEm6sNaFHpmKsH6jj
Gas used: 21063
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 261
Minted NFT with id '6' of template with id '3'
Tx-Hash: th_QYCf4BCQzzeW5mY2wMWR5cCALRB7mnBbtcbTbBaXgWr22Hbvt
Gas used: 21076
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 262
Created template with id '4'
Tx-Hash: th_mjh5knapnbjGVqwVy4FJFJekNaRLNbpuqqK1pxreMGuf8Pg9Y
Gas used: 16491
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 263
Minted NFT with id '7' of template with id '4'
Tx-Hash: th_EqgSR2B4v2dke2TVJzDpfvBkZhXa4KPzhf5YHjECpbNgnu2n4
Gas used: 21089
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 264
Minted NFT with id '8' of template with id '4'
Tx-Hash: th_wdTL1jFkSte4jy6FRSufSYWNYwUqaebTzhoaHBoBuyU5V3Buk
Gas used: 21102
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 265
Minted NFT with id '9' of template with id '4'
Tx-Hash: th_PzKUYMmFV2D6ir5Sz8rqd8jo7uodvR7WTPbUkL3TvpU4yPKuK
Gas used: 21115
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 266
Minted NFT with id '10' of template with id '4'
Tx-Hash: th_j1eGrdsqD4ToXgaNZRBaudP82v5Ngzoezds113Hvrrg4ZcbMs
Gas used: 21128
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 267
Created template with id '5'
Tx-Hash: th_2FPVLnCfCy7mmiwWFcyhHaWi3cW9KHNK4EjCYiEmGG9kaM58bp
Gas used: 16491
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 268
Minted NFT with id '11' of template with id '5'
Tx-Hash: th_i3kucKLr5uR8KL5WRrUXfbuApdpWQYyHmYk3deUPpN2aeqMQD
Gas used: 21141
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 269
Minted NFT with id '12' of template with id '5'
Tx-Hash: th_qwNGL9T2WgRWks3rFLTMJdCTLGYCqKYbRd3yfLpSQAhcfD9ZQ
Gas used: 21154
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 270
Minted NFT with id '13' of template with id '5'
Tx-Hash: th_DUTXCMRVdwsRnDSLEUjjHVu4sR31KiQ8nYatsteTn8y5xzLXT
Gas used: 21167
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 271
Minted NFT with id '14' of template with id '5'
Tx-Hash: th_292MwJQzH9SEQXzDL6uYXnzKFXRn7rMrqTeGisFssBb64CHuaQ
Gas used: 21180
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 272
Minted NFT with id '15' of template with id '5'
Tx-Hash: th_2u1PTGYhaoqUfM1szyHKK56V5YfhrUDTFohYqfYKh9VQJCRQRt
Gas used: 21193
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 273
Created template with id '6'
Tx-Hash: th_zL7FxDH3ukaaaspC2S1DgFvEdB5vKWsGZrLgTACGTT9kzF1Er
Gas used: 16491
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 274
Minted NFT with id '16' of template with id '6'
Tx-Hash: th_bZWX3j25qP4EBCp256wkrZRM9wVtf6sB2XmWQnQkRbq7Y5SVr
Gas used: 21206
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 275
Minted NFT with id '17' of template with id '6'
Tx-Hash: th_Ru9rSyS1yxa9L3WtomU6R1TCBSuo85w3RvyEHY7koXgtWtsK5
Gas used: 21219
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 276
Minted NFT with id '18' of template with id '6'
Tx-Hash: th_r3Y1r4imxc8hsm5Hg5Sx1ehdmkmPJg8JwasUyqTQFWHpNDdR9
Gas used: 21232
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 277
Minted NFT with id '19' of template with id '6'
Tx-Hash: th_2ikkQHRmEi2e4eAACrBQQos4tGRHTF4vyb7czKDTzThQgSP4b7
Gas used: 21245
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 278
Minted NFT with id '20' of template with id '6'
Tx-Hash: th_Rp5YY6jyrekoaYQktK8cYo6vHq95RSR7oJwMR1C6GyCkmiMhb
Gas used: 21258
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 279
Minted NFT with id '21' of template with id '6'
Tx-Hash: th_2At6Qx85DpWK3CEopsysVL9TjRi9cKBHGSk6Juz3TTzDctZRsv
Gas used: 21271
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 280
Created template with id '7'
Tx-Hash: th_2rVi99vxGW4c7YuQpYiGDy9fvxbLSwqCyQytEaq9V2eDQQGVxo
Gas used: 16491
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 281
Minted NFT with id '22' of template with id '7'
Tx-Hash: th_GtdqdL4g4TJ1ZQc8VcLH1G3JjjjkcGzhxTRt4RhUGpaPC1mXp
Gas used: 21284
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 282
Minted NFT with id '23' of template with id '7'
Tx-Hash: th_cwXbjKqamB4o4h8exxt4HyfDVkL7ewhwzLQ8HEkW8hdeC6GPa
Gas used: 21297
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 283
Minted NFT with id '24' of template with id '7'
Tx-Hash: th_saePVZtTqtbLqMHdfBLQUq8MaUSY9rQgk9iMVvWZnQ18j4yap
Gas used: 21310
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 284
Minted NFT with id '25' of template with id '7'
Tx-Hash: th_3r5YUspr7NTUvN1cuDpUZNwJkUmVhT6cS9qywGLBcbkjdZLFw
Gas used: 21323
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 285
Minted NFT with id '26' of template with id '7'
Tx-Hash: th_YdKDjAa4Jt2SKA61ZV3o9aGhJuUPi4gTcnjM3ymju1YUWAuGi
Gas used: 21336
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 286
Minted NFT with id '27' of template with id '7'
Tx-Hash: th_saGZ21Boi18czSZBPf4KNoHx81a56r1GHXhhykjTQqfPdr8pD
Gas used: 21349
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 287
Minted NFT with id '28' of template with id '7'
Tx-Hash: th_2BGPc4qHNAK25ZmjX6KkiA9ZuJY59DjSWVhTumwmFjGva3mZzK
Gas used: 21362
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 288
Created template with id '8'
Tx-Hash: th_ojhH9bD7kGRpgZ6rXob2qi5asBKsYTdbSVaKzGdpfP6wiRxz4
Gas used: 16491
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 289
Minted NFT with id '29' of template with id '8'
Tx-Hash: th_2J41T5D4gLyFb6KMZU8Knn6BtaaxvDttqgt4XzC1kjC2fc2e5R
Gas used: 21375
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 290
Minted NFT with id '30' of template with id '8'
Tx-Hash: th_29p3pK1LLnMmhZePx6vrEn3ZXccXKfGPFBShPqST9eQQ2NqcVu
Gas used: 21388
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 291
Minted NFT with id '31' of template with id '8'
Tx-Hash: th_2U99fvrvXrkxkcwtycVmKscAJaXubEPmNd8XoBsa2NyC34eUc2
Gas used: 21426
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 292
Minted NFT with id '32' of template with id '8'
Tx-Hash: th_2KFFYMZMumtEbjDTYv7aYv3eh9psS5w1Lyvj2pdUoRZWkK7R9T
Gas used: 21441
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 293
Minted NFT with id '33' of template with id '8'
Tx-Hash: th_qw7jZ6UxryTYnBq8dqeDn8Kb9Nphptn59DgQzGoTzN5hNykJd
Gas used: 21454
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 294
Minted NFT with id '34' of template with id '8'
Tx-Hash: th_WuwCj1ed4WhmL5C1v7NakQXA9Npikg6iYrqxEo2g8FwXKQ1ai
Gas used: 21467
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 295
Minted NFT with id '35' of template with id '8'
Tx-Hash: th_SxjDmD8bsXtHJkA7xyVRWNiB28tdQucoJSkhqxKJae445afrk
Gas used: 21480
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
Using nonce: 296
Minted NFT with id '36' of template with id '8'
Tx-Hash: th_NxjFwCYKSyCULjgQVgkVx6pW8jjntWK9kpyeWAnmEz4HLjAot
Gas used: 21493
------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------
```
</details>

</details>

## Simple-NFT-Viewer

This repository also provides you an example frontend, the [Simple-NFT-Viewer](./simple-nft-viewer) which is written in Vue.js.

It fetches the NFT metadata from contract [ct_2QTanakTwkp2p68n3aR296iE2ad4tHH3ov8kRy8ySF4xQuunM8](https://explorer.testnet.aeternity.io/contracts/transactions/ct_2QTanakTwkp2p68n3aR296iE2ad4tHH3ov8kRy8ySF4xQuunM8) and displays:
 - Name of the NFT collection
 - Name, Description and Image of all NFTs

## Congratulations
Now you know everything to get started with minting your own and unique NFT collection on the æternity blockchain :-)