const { assert, expect, use } = require('chai');
const { utils } = require('@aeternity/aeproject');
const chaiAsPromised = require('chai-as-promised');

use(chaiAsPromised);

const CONTRACT_SOURCE = './contracts/CollectionTemplateEditionNFTs.aes';
const RECEIVER_CONTRACT_SOURCE = './contracts/nft-receiver-example/AEX141NFTReceiverExample.aes';

const collectionTemplateData = require('../nfts/collection_templates.json');

describe('CollectionTemplateEditionNFTs', () => {
  let aeSdk;
  let contract;
  let accounts;

  let totalMintCount = 0;
  let allTokensToBeMinted = [];

  before(async () => {
    aeSdk = await utils.getSdk();
    accounts = utils.getDefaultAccounts();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const fileSystem = utils.getFilesystem(CONTRACT_SOURCE);

    // get content of contract
    const source = utils.getContractContent(CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await aeSdk.getContractInstance({ source, fileSystem });

    // deploy the contract
    await contract.deploy([
      collectionTemplateData.name,
      collectionTemplateData.symbol,
      8
    ]);

    // init and deploy receiver contract
    const receiver_contract_source = utils.getContractContent(RECEIVER_CONTRACT_SOURCE);
    receiver_contract = await aeSdk.getContractInstance({ source: receiver_contract_source, fileSystem: utils.getFilesystem(RECEIVER_CONTRACT_SOURCE) });
    await receiver_contract.deploy();
  });

  describe('NFT collection', async () => {
    it('aex141_extensions', async () => {
      const { decodedResult } = await contract.methods.aex141_extensions();
      assert.deepEqual(decodedResult, ['mintable_templates', 'mintable_templates_limit','mutable_attributes', 'burnable']);
    });
    it('meta_info', async () => {
      const { decodedResult } = await contract.methods.meta_info();
      assert.equal(decodedResult.name, collectionTemplateData.name);
      assert.equal(decodedResult.symbol, collectionTemplateData.symbol);
      assert.notEqual(decodedResult.metadata_type.MAP, undefined);
      assert.equal(decodedResult.metadata_type.URL, undefined);
      assert.equal(decodedResult.metadata_type.OBJECT_ID, undefined);
      assert.equal(decodedResult.base_url, undefined);
    });
    it('template_limit', async () => {
      const { decodedResult } = await contract.methods.template_limit();
      assert.equal(decodedResult, 8);
    });
  });

  describe('Template creation', async () => {
    it('failed template creation', async () => {;
      await expect(
        contract.methods.create_template({'MetadataIdentifier': ["ipfs://..."]}, -1, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "EDITION_LIMIT_INVALID"`);
      await expect(
        contract.methods.create_template({'MetadataIdentifier': ["ipfs://..."]}, 0, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "EDITION_LIMIT_INVALID"`);
      await expect(
        contract.methods.create_template({'MetadataMap': [new Map()]}, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "METADATA_TYPE_NOT_ALLOWED"`);
      await expect(
        contract.methods.create_template({'MetadataIdentifier': ["ipfs://..."]}, undefined, { onAccount: accounts[1] }))
        .to.be.rejectedWith(`Invocation failed: "ONLY_CONTRACT_OWNER_CALL_ALLOWED"`);
    });

    it('template creation', async () => {;
      for(let i=0; i<collectionTemplateData.templates.length; i++) {
        const createTemplateTx =
          await contract.methods.create_template(
            {'MetadataIdentifier': [collectionTemplateData.templates[i].immutable_metadata_url]},
            collectionTemplateData.templates[i].edition_limit, { onAccount: accounts[0] });
        assert.equal(createTemplateTx.decodedResult, i+1);
        assert.equal(createTemplateTx.decodedEvents[0].name, 'TemplateCreation');
        assert.equal(createTemplateTx.decodedEvents[0].args[0], i+1);
        assert.equal(createTemplateTx.decodedEvents[1].name, 'EditionLimit');
        assert.equal(createTemplateTx.decodedEvents[1].args[0], i+1);
        assert.equal(createTemplateTx.decodedEvents[1].args[1], collectionTemplateData.templates[i].edition_limit);
      }

      // check template
      let dryRunTemplate = await contract.methods.template(0);
      assert.equal(dryRunTemplate.decodedResult, undefined);

      // check template_supply
      let dryRunTemplateCount = await contract.methods.template_supply();
      assert.equal(dryRunTemplateCount.decodedResult, 8);

      for(let i=0; i<collectionTemplateData.templates.length; i++) {
        dryRunTemplate = await contract.methods.template(i+1);
        let expectedTemplate = {
          immutable_metadata: {
            'MetadataIdentifier': [collectionTemplateData.templates[i].immutable_metadata_url]
          },
          edition_limit: BigInt(collectionTemplateData.templates[i].edition_limit),
          edition_supply: BigInt(0)
        }
        assert.deepEqual(dryRunTemplate.decodedResult, expectedTemplate);
      }
    });
  });

  describe('NFT specific interactions', async () => {
    it('failed minting - basic check', async () => {
      const address = await accounts[0].address();
      await expect(
        contract.methods.template_mint(address, 0, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TEMPLATE_ID_NOT_EXISTS"`);
      await expect(
        contract.methods.template_mint(address, 1, undefined, { onAccount: accounts[1] }))
        .to.be.rejectedWith(`Invocation failed: "ONLY_CONTRACT_OWNER_CALL_ALLOWED"`);
    });

    it('minting', async () => {
      const address = await accounts[0].address();

      // check total supply before minting
      let totalSupply = await contract.methods.total_supply();
      assert.equal(totalSupply.decodedResult, 0)

      // mint all nfts
      for(let i=0; i<collectionTemplateData.templates.length; i++) {
        for(let j=0; j<collectionTemplateData.templates[i].edition_limit; j++) {
          const templateMintTx = await contract.methods.template_mint(address, i+1, undefined, { onAccount: accounts[0] });
          totalMintCount++;
          assert.equal(templateMintTx.decodedEvents[0].name, 'TemplateMint');
          assert.equal(templateMintTx.decodedEvents[0].args[0], address);
          assert.equal(templateMintTx.decodedEvents[0].args[1], i+1);
          assert.equal(templateMintTx.decodedEvents[0].args[2], totalMintCount);
          assert.equal(templateMintTx.decodedEvents[0].args[3], `${j+1}`);
          assert.equal(templateMintTx.decodedResult, totalMintCount);
        }
      }

      for(let i=0; i<totalMintCount; i++) {
        allTokensToBeMinted.push(BigInt(i+1));
      }

      // check total supply after minting
      totalSupplyDryRun = await contract.methods.total_supply();
      assert.equal(totalSupplyDryRun.decodedResult, totalMintCount)

      // check amount of NFTs of the owner / minter
      const balanceDryRun = await contract.methods.balance(address);
      assert.equal(balanceDryRun.decodedResult, totalMintCount);

      // check NFT ids of the owner / minter
      const getOwnedTokensDryRun = await contract.methods.get_owned_tokens(address);
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, allTokensToBeMinted);

      // expect metadata for NFT with id "0" to be not existent as we start counting with id "1"
      let metadataDryRun = await contract.methods.metadata(0);
      assert.equal(metadataDryRun.decodedResult, undefined);

      // expect metadata for NFT with id "1" to equal the metadata of the first minted NFT
      metadataDryRun = await contract.methods.metadata(1);
      assert.deepEqual(metadataDryRun.decodedResult.MetadataMap[0], new Map([['template_id', '1'], ['edition_serial', '1']]));

      // expect metadata for NFT with last id to equal the metadata of the last minted NFT
      metadataDryRun = await contract.methods.metadata(totalMintCount);
      assert.deepEqual(metadataDryRun.decodedResult.MetadataMap[0], new Map([['template_id', '8'], ['edition_serial', '8']]));
    });

    it('failed minting - edition limit check', async () => {
      const address = await accounts[0].address();
      for(let i=0; i<8; i++) {
        await expect(
          contract.methods.template_mint(address, i+1, undefined, { onAccount: accounts[0] }))
          .to.be.rejectedWith(`Invocation failed: "EDITION_LIMIT_EXCEEDED"`);
      }
    });

    it('failed transfer', async () => {
      const from = await accounts[0].address();
      await expect(
        contract.methods.transfer(from, 8, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "SENDER_MUST_NOT_BE_RECEIVER"`);
    });

    it('transfer', async () => {
      const from = await accounts[0].address();
      
      // expect successful transfer
      const to = await accounts[1].address();
      const transferTx = await contract.methods.transfer(to, totalMintCount, { onAccount: accounts[0] });
      assert.equal(transferTx.decodedEvents[0].name, 'Transfer');
      assert.equal(transferTx.decodedEvents[0].args[0], from);
      assert.equal(transferTx.decodedEvents[0].args[1], to);
      assert.equal(transferTx.decodedEvents[0].args[2], totalMintCount);

      // check balances after transfer
      let balanceDryRun = await contract.methods.balance(from);
      assert.equal(balanceDryRun.decodedResult, totalMintCount - 1);
      balanceDryRun = await contract.methods.balance(to);
      assert.equal(balanceDryRun.decodedResult, 1);

      // check owned NFTs after transfer
      let getOwnedTokensDryRun = await contract.methods.get_owned_tokens(from);
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, allTokensToBeMinted.slice(0, -1));
      getOwnedTokensDryRun = await contract.methods.get_owned_tokens(to);
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, [BigInt(totalMintCount)]);
    });

    it('failed burn', async () => {
      await expect(
        contract.methods.burn(0, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TOKEN_NOT_EXISTS"`);
      await expect(
        contract.methods.burn(1, { onAccount: accounts[1] }))
        .to.be.rejectedWith(`Invocation failed: "ONLY_OWNER_APPROVED_OR_OPERATOR_CALL_ALLOWED"`);
    });

    it('burn', async () => {
      // burn
      let burnTx = await contract.methods.burn(1, { onAccount: accounts[0] });
      assert.equal(burnTx.decodedEvents[0].name, 'Burn');
      assert.equal(burnTx.decodedEvents[0].args[0], await accounts[0].address());
      assert.equal(burnTx.decodedEvents[0].args[1], 1);

      // burn again
      burnTx = await contract.methods.burn(totalMintCount, { onAccount: accounts[1] });
      assert.equal(burnTx.decodedEvents[0].name, 'Burn');
      assert.equal(burnTx.decodedEvents[0].args[0], await accounts[1].address());
      assert.equal(burnTx.decodedEvents[0].args[1], totalMintCount);

      // check balances after burn
      let balanceDryRun = await contract.methods.balance(await accounts[0].address());
      assert.equal(balanceDryRun.decodedResult, totalMintCount - 2);
      balanceDryRun = await contract.methods.balance(await accounts[1].address());
      assert.equal(balanceDryRun.decodedResult, 0);

      // check owned NFTs after transfer
      let getOwnedTokensDryRun = await contract.methods.get_owned_tokens(await accounts[0].address());
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, allTokensToBeMinted.slice(1, -1));
      getOwnedTokensDryRun = await contract.methods.get_owned_tokens(await accounts[1].address());
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, []);

      // check total supply after burn
      const totalSupplyDryRun = await contract.methods.total_supply();
      assert.equal(totalSupplyDryRun.decodedResult, totalMintCount - 2);
    });

    it('failed update of mutable metadata', async () => {
      const updatedMutableAttributes = '{"level":1}';
      await expect(
        contract.methods.update_mutable_attributes(1, updatedMutableAttributes, { onAccount: accounts[1] }))
        .to.be.rejectedWith(`Invocation failed: "ONLY_CONTRACT_OWNER_CALL_ALLOWED"`);
      await expect(
        contract.methods.update_mutable_attributes(1, updatedMutableAttributes, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TOKEN_NOT_EXISTS"`);
    });

    it('update mutable metadata', async () => {
      const updatedMutableAttributes = '{"level":1}';
      // check current attributes
      let dryRunMetadata = await contract.methods.metadata(2);
      assert.equal(dryRunMetadata.decodedResult.MetadataMap[0].get('mutable_attributes'), undefined);

      // update mutable attributes
      const updateMutableAttributesTx = await contract.methods.update_mutable_attributes(2, updatedMutableAttributes, { onAccount: accounts[0] });
      assert.equal(updateMutableAttributesTx.decodedEvents[0].name, 'MutableAttributesUpdate');
      assert.equal(updateMutableAttributesTx.decodedEvents[0].args[0], 2);
      assert.equal(updateMutableAttributesTx.decodedEvents[0].args[1], updatedMutableAttributes);

      // check updated attributes
      dryRunMetadata = await contract.methods.metadata(2);
      assert.equal(dryRunMetadata.decodedResult.MetadataMap[0].get('mutable_attributes'), updatedMutableAttributes);
    });
  });

  describe('Template interactions', async () => {
    const fileSystem = utils.getFilesystem(CONTRACT_SOURCE);
    const source = utils.getContractContent(CONTRACT_SOURCE);

    it('template creation, limit & deletion', async () => {
      const template_level_contract = await aeSdk.getContractInstance({ source, fileSystem });
      // deploy contract
      await template_level_contract.deploy(['template_level_example', 'TLE', 2]);

      // check template supply
      let dryRunTemplateSupply = await template_level_contract.methods.template_supply();
      assert.equal(dryRunTemplateSupply.decodedResult, 0);

      // create two templates
      await template_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder1']}, undefined, { onAccount: accounts[0] });
      await template_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder2']}, undefined, { onAccount: accounts[0] });

      // should not be possible to create another template
      await expect(
        template_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder3']}, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TEMPLATE_LIMIT_REACHED"`);
      
      // check template supply
      dryRunTemplateSupply = await template_level_contract.methods.template_supply();
      assert.equal(dryRunTemplateSupply.decodedResult, 2);

      // delete template
      let deleteTemplateTx = await template_level_contract.methods.delete_template(1, { onAccount: accounts[0] });
      assert.equal(deleteTemplateTx.decodedEvents[0].name, 'TemplateDeletion');
      assert.equal(deleteTemplateTx.decodedEvents[0].args[0], 1);

      // cannot delete a template that has already been deleted
      await expect(
        template_level_contract.methods.delete_template(1, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TEMPLATE_ID_NOT_EXISTS"`);

      // check template supply
      dryRunTemplateSupply = await template_level_contract.methods.template_supply();
      assert.equal(dryRunTemplateSupply.decodedResult, 1);

      // check template not existing anymore
      let dryRunTemplate = await template_level_contract.methods.template(1);
      assert.equal(dryRunTemplate.decodedResult, undefined);

      // create a new templat, should be possible after deletion
      const createTemplateTx = await template_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder3']}, undefined, { onAccount: accounts[0] });
      assert.equal(createTemplateTx.decodedResult, 3);

      // check template count
      dryRunTemplateSupply = await template_level_contract.methods.template_supply();
      assert.equal(dryRunTemplateSupply.decodedResult, 2);

      // check total supply
      let dryRunTotalSupply = await template_level_contract.methods.total_supply();
      assert.equal(dryRunTotalSupply.decodedResult, 0);

      // mint an NFT for template with id 3
      await template_level_contract.methods.template_mint(await accounts[0].address(), 3, undefined, { onAccount: accounts[0] });

      // check total supply
      dryRunTotalSupply = await template_level_contract.methods.total_supply();
      assert.equal(dryRunTotalSupply.decodedResult, 1);

      // should not be possible to delete a template after an NFT has been minted based on it
      await expect(
        template_level_contract.methods.delete_template(3, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TEMPLATE_DELETION_NOT_ALLOWED"`);
    });

    it('template limit changes', async () => {
      const template_limit_contract = await aeSdk.getContractInstance({ source, fileSystem });
      // deploy contract
      await template_limit_contract.deploy(["template_limit_contract_example", "TECE", 3]);

      // create three templates
      await template_limit_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder1']}, undefined, { onAccount: accounts[0] });
      await template_limit_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder2']}, undefined, { onAccount: accounts[0] });
      await template_limit_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder3']}, undefined, { onAccount: accounts[0] });

      // should not be possible to create another template
      await expect(
        template_limit_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder4']}, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TEMPLATE_LIMIT_REACHED"`);

      // check various conditions for changing the template limit
      await expect(
        template_limit_contract.methods.decrease_template_limit(4, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TEMPLATE_LIMIT_INCREASE_NOT_ALLOWED"`);
      await expect(
        template_limit_contract.methods.decrease_template_limit(3, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "NO_CHANGE_PROVIDED"`);
      await expect(
        template_limit_contract.methods.decrease_template_limit(2, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "MORE_TEMPLATES_ALREADY_IN_EXISTENCE"`);

      // delete a template
      await template_limit_contract.methods.delete_template(1, { onAccount: accounts[0] });

      // after deleting a template it should be possible to decrease the limit
      const changeTemplateLimitTx = await template_limit_contract.methods.decrease_template_limit(2, { onAccount: accounts[0] });
      assert.equal(changeTemplateLimitTx.decodedEvents[0].name, 'TemplateLimitDecrease');
      assert.equal(changeTemplateLimitTx.decodedEvents[0].args[0], 3);
      assert.equal(changeTemplateLimitTx.decodedEvents[0].args[1], 2);

      // should not be possible to create another template (again)
      await expect(
        template_limit_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder4']}, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TEMPLATE_LIMIT_REACHED"`);
    });

    it('edition level', async () => {
      const edition_level_contract = await aeSdk.getContractInstance({ source, fileSystem });
      // deploy contract
      await edition_level_contract.deploy(["edition_level_example", "TLE", 10]);

      // expect creation of template with invalid edition limit to fail
      await expect(
        edition_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder1']}, -1, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "EDITION_LIMIT_INVALID"`);
      await expect(
        edition_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder1']}, 0, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "EDITION_LIMIT_INVALID"`);
      
      // creation of template with unlimited edition size
      let createTemplateTx = await edition_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder1']}, undefined, { onAccount: accounts[0] });
      assert.equal(createTemplateTx.decodedEvents.length, 1);
      assert.equal(createTemplateTx.decodedEvents[0].name, 'TemplateCreation');
      assert.equal(createTemplateTx.decodedEvents[0].args[0], 1);
      // minting various NFTs should be possible
      for(let i=0; i<5; i++) {
        await edition_level_contract.methods.template_mint(await accounts[0].address(), 1, undefined, { onAccount: accounts[0] });
      }
      // check template
      let dryRunTemplate = await edition_level_contract.methods.template(1);
      assert.deepEqual(dryRunTemplate.decodedResult,
        {
          immutable_metadata: {
            'MetadataIdentifier': ['url_placeholder1']
          },
          edition_limit: undefined,
          edition_supply: BigInt(5)
        });

      // creation of template with edition size 1
      createTemplateTx = await edition_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder2']}, 1, { onAccount: accounts[0] });
      assert.equal(createTemplateTx.decodedEvents.length, 2); // expecting two events now
      assert.equal(createTemplateTx.decodedEvents[1].name, 'EditionLimit');
      assert.equal(createTemplateTx.decodedEvents[1].args[0], 2);
      assert.equal(createTemplateTx.decodedEvents[1].args[1], 1);
      // minting the unique NFT based on a template
      await edition_level_contract.methods.template_mint(await accounts[0].address(), 2, undefined, { onAccount: accounts[0] });
      // expect another mint of the template to fail
      await expect(
        edition_level_contract.methods.template_mint(await accounts[0].address(), 2, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "EDITION_LIMIT_EXCEEDED"`);
      // check template
      dryRunTemplate = await edition_level_contract.methods.template(2);
      assert.deepEqual(dryRunTemplate.decodedResult,
        {
          immutable_metadata: {
            'MetadataIdentifier': ['url_placeholder2']
          },
          edition_limit: BigInt(1),
          edition_supply: BigInt(1)
        });

      // creation of template with edition size 3
      await edition_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder3']}, 3, { onAccount: accounts[0] });
      // mint two NFTs based on template id 3
      await edition_level_contract.methods.template_mint(await accounts[0].address(), 3, undefined, { onAccount: accounts[0] });
      await edition_level_contract.methods.template_mint(await accounts[0].address(), 3, undefined, { onAccount: accounts[0] });
      // check template
      dryRunTemplate = await edition_level_contract.methods.template(3);
      assert.deepEqual(dryRunTemplate.decodedResult,
        {
          immutable_metadata: {
            'MetadataIdentifier': ['url_placeholder3']
          },
          edition_limit: BigInt(3),
          edition_supply: BigInt(2)
        });

      // create new template with unlimited edition size
      await edition_level_contract.methods.create_template({'MetadataIdentifier': ['url_placeholder4']}, undefined, { onAccount: accounts[0] });
      // check template
      dryRunTemplate = await edition_level_contract.methods.template(4);
      assert.deepEqual(dryRunTemplate.decodedResult,
        {
          immutable_metadata: {
            'MetadataIdentifier': ['url_placeholder4']
          },
          edition_limit: undefined,
          edition_supply: BigInt(0)
        });

      // mint three NFTs based on template id 4
      await edition_level_contract.methods.template_mint(await accounts[0].address(), 4, undefined, { onAccount: accounts[0] });
      await edition_level_contract.methods.template_mint(await accounts[0].address(), 4, undefined, { onAccount: accounts[0] });
      await edition_level_contract.methods.template_mint(await accounts[0].address(), 4, undefined, { onAccount: accounts[0] });
      // check template
      dryRunTemplate = await edition_level_contract.methods.template(4);
      assert.deepEqual(dryRunTemplate.decodedResult,
        {
          immutable_metadata: {
            'MetadataIdentifier': ['url_placeholder4']
          },
          edition_limit: undefined,
          edition_supply: BigInt(3)
        });

      // decrease the edition limit
      const changeEditionLimitTx = await edition_level_contract.methods.decrease_edition_limit(4, 3, { onAccount: accounts[0] });
      assert.equal(changeEditionLimitTx.decodedEvents[0].name, 'EditionLimitDecrease');
      assert.equal(changeEditionLimitTx.decodedEvents[0].args[0], 4);
      assert.equal(changeEditionLimitTx.decodedEvents[0].args[1], 0);
      assert.equal(changeEditionLimitTx.decodedEvents[0].args[2], 3);
      // check template
      dryRunTemplate = await edition_level_contract.methods.template(4);
      assert.deepEqual(dryRunTemplate.decodedResult,
        {
          immutable_metadata: {
            'MetadataIdentifier': ['url_placeholder4']
          },
          edition_limit: BigInt(3),
          edition_supply: BigInt(3)
        });
      // expect another mint to fail due to the new limit
      await expect(
        edition_level_contract.methods.template_mint(await accounts[0].address(), 4, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "EDITION_LIMIT_EXCEEDED"`);
      
      // expect failed change of edition limit
      await expect(
        edition_level_contract.methods.decrease_edition_limit(4, 4, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "EDITION_LIMIT_INCREASE_NOT_ALLOWED"`);
      await expect(
        edition_level_contract.methods.decrease_edition_limit(4, 3, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "NO_CHANGE_PROVIDED"`);
      await expect(
        edition_level_contract.methods.decrease_edition_limit(4, 2, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "MORE_EDITIONS_ALREADY_IN_EXISTENCE"`);
    });
  });
});
