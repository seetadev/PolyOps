const { assert, expect, use } = require('chai');
const { utils } = require('@aeternity/aeproject');
const chaiAsPromised = require('chai-as-promised');

use(chaiAsPromised);

BigInt.prototype.toJSON = function() { return this.toString() }

const CONTRACT_SOURCE = './contracts/CollectionUniqueNFTs.aes';
const RECEIVER_CONTRACT_SOURCE = './contracts/nft-receiver-example/AEX141NFTReceiverExample.aes';
const OPERATOR_CONTRACT_SOURCE = './contracts/operator-example/OperatorExample.aes'

const collectionUniqueMetadata = require('../nfts/collection_unique_nfts.json');

describe('CollectionUniqueNFTs', () => {
  let aeSdk;
  let contract;
  let receiverContract;
  let accounts;

  before(async () => {
    aeSdk = await utils.getSdk();
    accounts = utils.getDefaultAccounts();

    // a filesystem object must be passed to the compiler if the contract uses custom includes
    const fileSystem = utils.getFilesystem(CONTRACT_SOURCE);

    // get content of contract
    const source = utils.getContractContent(CONTRACT_SOURCE);

    // initialize the contract instance
    contract = await aeSdk.getContractInstance({ source, fileSystem });

    // expect failed deployment for invalid token limit
    await expect(
      contract.deploy([
        collectionUniqueMetadata.name,
        collectionUniqueMetadata.symbol,
        -1]))
      .to.be.rejectedWith(`Invocation failed: "TOKEN_LIMIT_INVALID"`);

    // deploy the contract
    const contractCreateTx = await contract.deploy([
      collectionUniqueMetadata.name,
      collectionUniqueMetadata.symbol,
      8]);
    // https://github.com/aeternity/aepp-sdk-js/issues/1692
    assert.equal(contractCreateTx.result.log[0].topics[1], 8);

    // init and deploy receiver contract
    const receiverContractSource = utils.getContractContent(RECEIVER_CONTRACT_SOURCE);
    receiverContract = await aeSdk.getContractInstance({ source: receiverContractSource, fileSystem: utils.getFilesystem(RECEIVER_CONTRACT_SOURCE) });
    await receiverContract.deploy();
  });

  describe('NFT collection', async () => {
    it('aex141_extensions', async () => {
      const { decodedResult } = await contract.methods.aex141_extensions();
      assert.deepEqual(decodedResult, ['mintable', 'mintable_limit','burnable']);
    });
    it('meta_info', async () => {
      const { decodedResult } = await contract.methods.meta_info();
      assert.equal(decodedResult.name, collectionUniqueMetadata.name);
      assert.equal(decodedResult.symbol, collectionUniqueMetadata.symbol);
      assert.notEqual(decodedResult.metadata_type.MAP, undefined);
      assert.equal(decodedResult.metadata_type.URL, undefined);
      assert.equal(decodedResult.metadata_type.OBJECT_ID, undefined);
      assert.equal(decodedResult.base_url, undefined);
    });
    it('token_limit', async () => {
      const { decodedResult } = await contract.methods.token_limit();
      assert.equal(decodedResult, 8);
    });
  });

  describe('NFT specific interactions', async () => {
    it('failed minting', async () => {
      const address = await accounts[0].address();
      await expect(
        contract.methods.mint(address, undefined, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "NO_METADATA_PROVIDED"`);
      await expect(
        contract.methods.mint(address, {'MetadataIdentifier': ['fails anyway ...']}, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "NOT_METADATA_MAP"`);
      await expect(
        contract.methods.mint(address, {'MetadataMap': [new Map()]}, undefined, { onAccount: accounts[1] }))
        .to.be.rejectedWith(`Invocation failed: "ONLY_CONTRACT_OWNER_CALL_ALLOWED"`);
    });
    
    it('minting', async () => {
      const address = await accounts[0].address();

      // check total supply before minting
      let totalSupply = await contract.methods.total_supply();
      assert.equal(totalSupply.decodedResult, 0)

      const metadataMapAllNFTs = new Array();
      for(let i=0; i<collectionUniqueMetadata.immutable_metadata_urls.length; i++) {
        metadataMapAllNFTs.push(new Map([['url', collectionUniqueMetadata.immutable_metadata_urls[i]]]))
      }

      // mint all nfts
      for(let i=0; i<collectionUniqueMetadata.immutable_metadata_urls.length; i++) {
        const mintTx = await contract.methods.mint(address, {'MetadataMap': [metadataMapAllNFTs[i]]}, undefined, { onAccount: accounts[0] });
        assert.equal(mintTx.decodedEvents[0].name, 'Mint');
        assert.equal(mintTx.decodedEvents[0].args[0], address);
        assert.equal(mintTx.decodedEvents[0].args[1], i+1);
      }

      // check total supply after minting
      totalSupplyDryRun = await contract.methods.total_supply();
      assert.equal(totalSupplyDryRun.decodedResult, 8);

      // check amount of NFTs of the owner / minter
      const balanceDryRun = await contract.methods.balance(address);
      assert.equal(balanceDryRun.decodedResult, 8);

      // check NFT ids of the owner / minter
      const getOwnedTokensDryRun = await contract.methods.get_owned_tokens(address);
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, [1n,2n,3n,4n,5n,6n,7n,8n]);

      // expect metadata for NFT with id "0" to be not existent as we start counting with id "1"
      let metadataDryRun = await contract.methods.metadata(0);
      assert.equal(metadataDryRun.decodedResult, undefined);

      // expect metadata for NFT with id "1" to equal the metadata of the first minted NFT
      metadataDryRun = await contract.methods.metadata(1);
      assert.deepEqual(metadataDryRun.decodedResult.MetadataMap[0], metadataMapAllNFTs[0]);

      // expect metadata for NFT with last id to equal the metadata of the last minted NFT
      metadataDryRun = await contract.methods.metadata(metadataMapAllNFTs.length);
      assert.deepEqual(metadataDryRun.decodedResult.MetadataMap[0], metadataMapAllNFTs[metadataMapAllNFTs.length - 1]);
    });

    it('failed mint due to minting_limit', async () => {
      // limit should be reached right now
      await expect(
        contract.methods.mint(await accounts[0].address(), {'MetadataMap': [new Map()]}, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TOKEN_LIMIT_REACHED"`);
    });

    it('failed decrease_token_limit', async () => {
      await expect(
        contract.methods.decrease_token_limit(5, { onAccount: accounts[1] }))
        .to.be.rejectedWith(`Invocation failed: "ONLY_CONTRACT_OWNER_CALL_ALLOWED"`);
      await expect(
        contract.methods.decrease_token_limit(9, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TOKEN_LIMIT_INCREASE_NOT_ALLOWED"`);
      await expect(
        contract.methods.decrease_token_limit(8, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "NO_CHANGE_PROVIDED"`);
      await expect(
        contract.methods.decrease_token_limit(7, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "MORE_TOKENS_ALREADY_IN_EXISTENCE"`);
    });

    it('transfer', async () => {
      // expect failed transfer
      const from = await accounts[0].address();
      await expect(
        contract.methods.transfer(from, 8, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "SENDER_MUST_NOT_BE_RECEIVER"`);
      
      // expect successful transfer
      const to = await accounts[1].address();
      const transferTx = await contract.methods.transfer(to, 8, { onAccount: accounts[0] });
      assert.equal(transferTx.decodedEvents[0].name, 'Transfer');
      assert.equal(transferTx.decodedEvents[0].args[0], from);
      assert.equal(transferTx.decodedEvents[0].args[1], to);
      assert.equal(transferTx.decodedEvents[0].args[2], 8);

      // check balances after transfer
      let balanceDryRun = await contract.methods.balance(from);
      assert.equal(balanceDryRun.decodedResult, 7);
      balanceDryRun = await contract.methods.balance(to);
      assert.equal(balanceDryRun.decodedResult, 1);

      // check owned NFTs after transfer
      let getOwnedTokensDryRun = await contract.methods.get_owned_tokens(from);
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, [1n,2n,3n,4n,5n,6n,7n]);
      getOwnedTokensDryRun = await contract.methods.get_owned_tokens(to);
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, [8n]);
    });

    it('failed burn', async () => {
      await expect(
        contract.methods.burn(10, { onAccount: accounts[0] }))
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
      burnTx = await contract.methods.burn(8, { onAccount: accounts[1] });
      assert.equal(burnTx.decodedEvents[0].name, 'Burn');
      assert.equal(burnTx.decodedEvents[0].args[0], await accounts[1].address());
      assert.equal(burnTx.decodedEvents[0].args[1], 8);

      // check balances after burn
      let balanceDryRun = await contract.methods.balance(await accounts[0].address());
      assert.equal(balanceDryRun.decodedResult, 6);
      balanceDryRun = await contract.methods.balance(await accounts[1].address());
      assert.equal(balanceDryRun.decodedResult, 0);

      // check owned NFTs after transfer
      let getOwnedTokensDryRun = await contract.methods.get_owned_tokens(await accounts[0].address());
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, [2n,3n,4n,5n,6n,7n]);
      getOwnedTokensDryRun = await contract.methods.get_owned_tokens(await accounts[1].address());
      assert.deepEqual(getOwnedTokensDryRun.decodedResult, []);

      // check total supply after burn
      const totalSupplyDryRun = await contract.methods.total_supply();
      assert.equal(totalSupplyDryRun.decodedResult, 6);
    });

    it('approval & operator (simple accounts)', async () => {
      // check get_approved
      let getApprovedDryRun = await contract.methods.get_approved(2);
      assert.equal(getApprovedDryRun.decodedResult, undefined);

      // check is approved
      let isApprovedDryRun = await contract.methods.is_approved(2, await accounts[1].address());
      assert.equal(isApprovedDryRun.decodedResult, false);

      // approve other account
      let approveTx = await contract.methods.approve(await accounts[1].address(), 2, true, { onAccount: accounts[0] });
      assert.equal(approveTx.decodedEvents[0].name, 'Approval');
      assert.equal(approveTx.decodedEvents[0].args[0], await accounts[0].address());
      assert.equal(approveTx.decodedEvents[0].args[1], await accounts[1].address());
      assert.equal(approveTx.decodedEvents[0].args[2], 2);
      assert.equal(approveTx.decodedEvents[0].args[3], "true");

      // check get_approved
      getApprovedDryRun = await contract.methods.get_approved(2);
      assert.equal(getApprovedDryRun.decodedResult, await accounts[1].address());

      // check is approved
      isApprovedDryRun = await contract.methods.is_approved(2, await accounts[1].address());
      assert.equal(isApprovedDryRun.decodedResult, true);

      // check is approved for all
      let isApprovedForAllDryRun = await contract.methods.is_approved_for_all(await accounts[1].address(), await accounts[2].address());
      assert.equal(isApprovedForAllDryRun.decodedResult, false);

      // approve all
      let approveAllTx = await contract.methods.approve_all(await accounts[2].address(), true, { onAccount: accounts[1] });
      assert.equal(approveAllTx.decodedEvents[0].name, 'ApprovalForAll');
      assert.equal(approveAllTx.decodedEvents[0].args[0], await accounts[1].address());
      assert.equal(approveAllTx.decodedEvents[0].args[1], await accounts[2].address());
      assert.equal(approveAllTx.decodedEvents[0].args[2], "true");

      // check is approved for all
      isApprovedForAllDryRun = await contract.methods.is_approved_for_all(await accounts[1].address(), await accounts[2].address());
      assert.equal(isApprovedForAllDryRun.decodedResult, true);

      // check owner
      let ownerDryRun = await contract.methods.owner(2);
      assert.equal(ownerDryRun.decodedResult, await accounts[0].address());

      // transfer as approved account to the approved account
      let transferTx = await contract.methods.transfer(await accounts[1].address(), 2, undefined, { onAccount: accounts[1] });
      assert.equal(transferTx.decodedEvents[0].name, 'Transfer');
      assert.equal(transferTx.decodedEvents[0].args[0], await accounts[0].address());
      assert.equal(transferTx.decodedEvents[0].args[1], await accounts[1].address());
      assert.equal(transferTx.decodedEvents[0].args[2], 2);

      // check get_approved after transfer
      getApprovedDryRun = await contract.methods.get_approved(2);
      assert.equal(getApprovedDryRun.decodedResult, undefined);

      // transfer another 2 NFTs from acc 0 to acc 1
      transferTx = await contract.methods.transfer(await accounts[1].address(), 3, undefined, { onAccount: accounts[0] });
      transferTx = await contract.methods.transfer(await accounts[1].address(), 4, undefined, { onAccount: accounts[0] });

      // check balances
      let balanceDryRun = await contract.methods.balance(await accounts[0].address());
      assert.equal(balanceDryRun.decodedResult, 3);
      balanceDryRun = await contract.methods.balance(await accounts[1].address());
      assert.equal(balanceDryRun.decodedResult, 3);

      // burn a token as operator (acc 2) from acc 1
      let burnTx = await contract.methods.burn(2, { onAccount: accounts[2] });
      assert.equal(burnTx.decodedEvents[0].name, 'Burn');
      assert.equal(burnTx.decodedEvents[0].args[0], await accounts[1].address());
      assert.equal(burnTx.decodedEvents[0].args[1], 2);

      // check balance
      balanceDryRun = await contract.methods.balance(await accounts[1].address());
      assert.equal(balanceDryRun.decodedResult, 2);

      // check total supply
      let totalSupplyDryRun = await contract.methods.total_supply();
      assert.equal(totalSupplyDryRun.decodedResult, 5);

      // transfer NFT from acc 1 back to acc 0 via operator (acc 2)
      transferTx = await contract.methods.transfer(await accounts[0].address(), 3, undefined, { onAccount: accounts[2] });

      // check failed burn of token id 3 owned by acc 0 as operator (acc 2) for acc 1
      await expect(
        contract.methods.burn(3, { onAccount: accounts[2] }))
        .to.be.rejectedWith(`Invocation failed: "ONLY_OWNER_APPROVED_OR_OPERATOR_CALL_ALLOWED"`);

      // remove operator rights
      approveAllTx = await contract.methods.approve_all(await accounts[2].address(), false, { onAccount: accounts[1] });
      assert.equal(approveAllTx.decodedEvents[0].name, 'ApprovalForAll');
      assert.equal(approveAllTx.decodedEvents[0].args[0], await accounts[1].address());
      assert.equal(approveAllTx.decodedEvents[0].args[1], await accounts[2].address());
      assert.equal(approveAllTx.decodedEvents[0].args[2], "false");

      // check failed transfer from acc 1 back to acc 0 via revoked operator (acc 2)
      await expect(
        contract.methods.transfer(await accounts[1].address(), 4, { onAccount: accounts[2] }))
        .to.be.rejectedWith(`Invocation failed: "ONLY_OWNER_APPROVED_OR_OPERATOR_CALL_ALLOWED"`);

      // transfer token id 4 back to acc 0
      transferTx = await contract.methods.transfer(await accounts[0].address(), 4, undefined, { onAccount: accounts[1] });

      // check final balance of acc 0
      balanceDryRun = await contract.methods.balance(await accounts[0].address());
      assert.equal(balanceDryRun.decodedResult, 5);
    });

    it('approval & operator (contracts example)', async () => {
      const operatorContractSource = utils.getContractContent(OPERATOR_CONTRACT_SOURCE);
      const operatorContract = await aeSdk.getContractInstance({ source: operatorContractSource, fileSystem: utils.getFilesystem(OPERATOR_CONTRACT_SOURCE) });
      await operatorContract.deploy();

      const operatorContractId = operatorContract.deployInfo.address;
      const operatorContractAddress = operatorContractId.replace("ct_", "ak_");

      // check get_approved
      let getApprovedDryRun = await contract.methods.get_approved(3);
      assert.equal(getApprovedDryRun.decodedResult, undefined);

      // check is approved
      let isApprovedDryRun = await contract.methods.is_approved(3, operatorContractAddress);
      assert.equal(isApprovedDryRun.decodedResult, false);

      // approve other account
      let approveTx = await contract.methods.approve(operatorContractAddress, 3, true, { onAccount: accounts[0] });
      assert.equal(approveTx.decodedEvents[0].name, 'Approval');
      assert.equal(approveTx.decodedEvents[0].args[0], await accounts[0].address());
      assert.equal(approveTx.decodedEvents[0].args[1], operatorContractAddress);
      assert.equal(approveTx.decodedEvents[0].args[2], 3);
      assert.equal(approveTx.decodedEvents[0].args[3], "true");

      // check get_approved
      getApprovedDryRun = await contract.methods.get_approved(3);
      assert.equal(getApprovedDryRun.decodedResult, operatorContractAddress);

      // check is approved
      isApprovedDryRun = await contract.methods.is_approved(3, operatorContractAddress);
      assert.equal(isApprovedDryRun.decodedResult, true);

      // check is approved for all
      let isApprovedForAllDryRun = await contract.methods.is_approved_for_all(await accounts[1].address(), operatorContractAddress);
      assert.equal(isApprovedForAllDryRun.decodedResult, false);

      // approve all
      let approveAllTx = await contract.methods.approve_all(operatorContractAddress, true, { onAccount: accounts[1] });
      assert.equal(approveAllTx.decodedEvents[0].name, 'ApprovalForAll');
      assert.equal(approveAllTx.decodedEvents[0].args[0], await accounts[1].address());
      assert.equal(approveAllTx.decodedEvents[0].args[1], operatorContractAddress);
      assert.equal(approveAllTx.decodedEvents[0].args[2], "true");

      // check is approved for all
      isApprovedForAllDryRun = await contract.methods.is_approved_for_all(await accounts[1].address(), operatorContractAddress);
      assert.equal(isApprovedForAllDryRun.decodedResult, true);

      // check owner
      let ownerDryRun = await contract.methods.owner(3);
      assert.equal(ownerDryRun.decodedResult, await accounts[0].address());

      // trigger transfer from acc 0 to acc 1 via operator contract
      let operatorTransferTx = await operatorContract.methods.trigger_transfer(contract.deployInfo.address, 3, await accounts[1].address(), undefined);
      assert.equal(operatorTransferTx.decodedEvents[0].name, 'Transfer');
      assert.equal(operatorTransferTx.decodedEvents[0].args[0], await accounts[0].address());
      assert.equal(operatorTransferTx.decodedEvents[0].args[1], await accounts[1].address());
      assert.equal(operatorTransferTx.decodedEvents[0].args[2], 3);

      // check get_approved after transfer
      getApprovedDryRun = await contract.methods.get_approved(3);
      assert.equal(getApprovedDryRun.decodedResult, undefined);

      // transfer another 2 NFTs from acc 0 to acc 1
      let transferTx = await contract.methods.transfer(await accounts[1].address(), 4, undefined, { onAccount: accounts[0] });
      transferTx = await contract.methods.transfer(await accounts[1].address(), 5, undefined, { onAccount: accounts[0] });

      // check balances
      let balanceDryRun = await contract.methods.balance(await accounts[0].address());
      assert.equal(balanceDryRun.decodedResult, 2);
      balanceDryRun = await contract.methods.balance(await accounts[1].address());
      assert.equal(balanceDryRun.decodedResult, 3);

      // burn a token as operator contract from acc 1
      let operatorBurnTx = await operatorContract.methods.trigger_burn(contract.deployInfo.address, 3);
      assert.equal(operatorBurnTx.decodedEvents[0].name, 'Burn');
      assert.equal(operatorBurnTx.decodedEvents[0].args[0], await accounts[1].address());
      assert.equal(operatorBurnTx.decodedEvents[0].args[1], 3);

      // check balance
      balanceDryRun = await contract.methods.balance(await accounts[1].address());
      assert.equal(balanceDryRun.decodedResult, 2);

      // check total supply
      let totalSupplyDryRun = await contract.methods.total_supply();
      assert.equal(totalSupplyDryRun.decodedResult, 4);

      // transfer NFT from acc 1 back to acc 0 via operator contract
      operatorTransferTx = await operatorContract.methods.trigger_transfer(contract.deployInfo.address, 4, await accounts[0].address(), undefined);

      // check failed burn of token id 4 owned by acc 0 as operator (acc 2) for acc 1
      await expect(
        operatorContract.methods.trigger_burn(contract.deployInfo.address, 4))
        .to.be.rejectedWith(`Invocation failed: "ONLY_OWNER_APPROVED_OR_OPERATOR_CALL_ALLOWED"`);

      // remove operator rights
      approveAllTx = await contract.methods.approve_all(operatorContractAddress, false, { onAccount: accounts[1] });
      assert.equal(approveAllTx.decodedEvents[0].name, 'ApprovalForAll');
      assert.equal(approveAllTx.decodedEvents[0].args[0], await accounts[1].address());
      assert.equal(approveAllTx.decodedEvents[0].args[1], operatorContractAddress);
      assert.equal(approveAllTx.decodedEvents[0].args[2], "false");

      // check failed transfer from acc 1 back to acc 0 via revoked operator (acc 2)
      await expect(
        operatorContract.methods.trigger_transfer(contract.deployInfo.address, 5, await accounts[0].address(), undefined))
        .to.be.rejectedWith(`Invocation failed: "ONLY_OWNER_APPROVED_OR_OPERATOR_CALL_ALLOWED"`);

      // transfer token id 5 back to acc 0
      transferTx = await contract.methods.transfer(await accounts[0].address(), 5, undefined, { onAccount: accounts[1] });

      // check final balance of acc 0
      balanceDryRun = await contract.methods.balance(await accounts[0].address());
      assert.equal(balanceDryRun.decodedResult, 4);
    });

    it('nft receiver example', async () => {
      const receiverContractId = receiverContract.deployInfo.address;
      const receiverContractAddress = receiverContractId.replace("ct_", "ak_");

      // failed transfer
      await expect(
        contract.methods.transfer(receiverContractAddress, 4, 'FAILS', { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "SAFE_TRANSFER_FAILED"`);

      // check original token owner of specific nft
      await expect(
        receiverContract.methods.get_nft_owner(contract.deployInfo.address, 4))
        .to.be.rejectedWith(`Invocation failed: "UNKNOWN_TOKEN_CONTRACT"`);

      // successful transfer
      let transferTx = await contract.methods.transfer(receiverContractAddress, 4, undefined, { onAccount: accounts[0] });
      assert.equal(transferTx.decodedEvents[0].name, 'Transfer');
      assert.equal(transferTx.decodedEvents[0].args[0], await accounts[0].address());
      assert.equal(transferTx.decodedEvents[0].args[1], receiverContractAddress);
      assert.equal(transferTx.decodedEvents[0].args[2], 4);

      const expectedContractToTokenOwnerResult =
        new Map([[contract.deployInfo.address, new Map([[4n, await accounts[0].address()]])]]);
      
      // check storage of original token owners
      let getContractToTokenownerDryRun = await receiverContract.methods.get_contract_to_tokenowner();
      assert.deepEqual(getContractToTokenownerDryRun.decodedResult,
        expectedContractToTokenOwnerResult);

      // check original token owner of specific nft
      let getNftOwnerDryRun = await receiverContract.methods.get_nft_owner(contract.deployInfo.address, 4);
      assert.equal(getNftOwnerDryRun.decodedResult, await accounts[0].address());

      // failed claim as wrong owner
      await expect(
        receiverContract.methods.claim_nft(contract.deployInfo.address, 4, { onAccount: accounts[1] }))
        .to.be.rejectedWith(`Invocation failed: "CLAIM_DENIED_NOT_OWNER"`);

      // claim token back
      const claimNftTx = await receiverContract.methods.claim_nft(contract.deployInfo.address, 4, { onAccount: accounts[0] });
      assert.equal(claimNftTx.decodedEvents[0].name, 'Transfer');
      assert.equal(claimNftTx.decodedEvents[0].args[0], receiverContractAddress);
      assert.equal(claimNftTx.decodedEvents[0].args[1], await accounts[0].address());
      assert.equal(claimNftTx.decodedEvents[0].args[2], 4);

      // check original token owner of specific nft
      getNftOwnerDryRun = await receiverContract.methods.get_nft_owner(contract.deployInfo.address, 4);
      assert.equal(getNftOwnerDryRun.decodedResult, undefined);

      // check storage of original token owners
      getContractToTokenownerDryRun = await receiverContract.methods.get_contract_to_tokenowner();
      assert.deepEqual(getContractToTokenownerDryRun.decodedResult, new Map([[contract.deployInfo.address, new Map()]]));
    });

    it('claim nft from contract', async () => {
      const receiverContractId = receiverContract.deployInfo.address;
      const receiverContractAddress = receiverContractId.replace("ct_", "ak_");

      // expect transfer_to_contract failing as not being called from a contract
      await expect(
        contract.methods.transfer_to_contract(4, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "CALLER_MUST_BE_A_CONTRACT"`);

      // expect transfer_nft_to_contract (which calls transfer_to_contract) failing due to missing approval
      await expect(
        receiverContract.methods.transfer_nft_to_contract(contract.deployInfo.address, 4, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "ONLY_OWNER_APPROVED_OR_OPERATOR_CALL_ALLOWED"`);

      // approve the receiverContract to control the NFT
      await contract.methods.approve(receiverContractAddress, 4, true, { onAccount: accounts[0] });

      // claim the NFT from the current owner to the contract
      // can be called from any account now as demonstrated, because receiverContract has approval to claim the NFT
      let transferTx = await receiverContract.methods.transfer_nft_to_contract(contract.deployInfo.address, 4, { onAccount: accounts[5] });
      assert.equal(transferTx.decodedEvents[0].name, 'Transfer');
      assert.equal(transferTx.decodedEvents[0].args[0], await accounts[0].address());
      assert.equal(transferTx.decodedEvents[0].args[1], receiverContractAddress);
      assert.equal(transferTx.decodedEvents[0].args[2], 4);

      const expectedContractToTokenOwnerResult =
        new Map([[contract.deployInfo.address, new Map([[4n, await accounts[0].address()]])]]);
      
      // check storage of original token owners
      let getContractToTokenownerDryRun = await receiverContract.methods.get_contract_to_tokenowner();
      assert.deepEqual(getContractToTokenownerDryRun.decodedResult,
        expectedContractToTokenOwnerResult);

      // check original token owner of specific nft
      let getNftOwnerDryRun = await receiverContract.methods.get_nft_owner(contract.deployInfo.address, 4);
      assert.equal(getNftOwnerDryRun.decodedResult, await accounts[0].address());

      // claim token back
      const claimNftTx = await receiverContract.methods.claim_nft(contract.deployInfo.address, 4, { onAccount: accounts[0] });
      assert.equal(claimNftTx.decodedEvents[0].name, 'Transfer');
      assert.equal(claimNftTx.decodedEvents[0].args[0], receiverContractAddress);
      assert.equal(claimNftTx.decodedEvents[0].args[1], await accounts[0].address());
      assert.equal(claimNftTx.decodedEvents[0].args[2], 4);

      // check original token owner of specific nft
      getNftOwnerDryRun = await receiverContract.methods.get_nft_owner(contract.deployInfo.address, 4);
      assert.equal(getNftOwnerDryRun.decodedResult, undefined);

      // check storage of original token owners
      getContractToTokenownerDryRun = await receiverContract.methods.get_contract_to_tokenowner();
      assert.deepEqual(getContractToTokenownerDryRun.decodedResult, new Map([[contract.deployInfo.address, new Map()]]));
    });

    it('decrease_token_limit after burns', async () => {
      // check total supply
      let totalSupplyDryRun = await contract.methods.total_supply();
      assert.equal(totalSupplyDryRun.decodedResult, 4);

      const changeTokenLimitTx = await contract.methods.decrease_token_limit(5, { onAccount: accounts[0] });
      assert.equal(changeTokenLimitTx.decodedEvents[0].name, 'TokenLimitDecrease');
      assert.equal(changeTokenLimitTx.decodedEvents[0].args[0], 8);
      assert.equal(changeTokenLimitTx.decodedEvents[0].args[1], 5);

      // mint a new token
      await contract.methods.mint(await accounts[0].address(), {'MetadataMap': [new Map()]}, undefined, { onAccount: accounts[0] });

      // check new total supply
      totalSupplyDryRun = await contract.methods.total_supply();
      assert.equal(totalSupplyDryRun.decodedResult, 5);

      // limit should be reached right now (again)
      await expect(
        contract.methods.mint(await accounts[0].address(), {'MetadataMap': [new Map()]}, undefined, { onAccount: accounts[0] }))
        .to.be.rejectedWith(`Invocation failed: "TOKEN_LIMIT_REACHED"`);
    });
  });
});
