// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {CALL_ACTOR_ID, DEFAULT_FLAG, METHOD_SEND, ADMIN_ROLE, MEMBER_ROLE } from "./base/DataDAOConstants.sol";
import "./base/DataDAOCore.sol";
import "./interfaces/IDataDAO.sol";
import "../openzeppelin/contracts/utils/math/SafeMath.sol";
import "../openzeppelin/contracts/access/AccessControl.sol";

contract DataDAO is IDataDAO, DataDAOCore, AccessControl {

    using SafeMath for uint256;
    
    /// @dev Gets a cid and returns Proposal details associated with the cid
    mapping(bytes => DataProposal) public proposals;

    /// @dev Gets a cid and returns Deal details associated with the cid
    mapping(bytes => Deal) public deals;
   
    /// @dev Gets a cid and provider returns true or false depending upon if its the providers of the cid
    mapping(bytes => mapping(uint64 => bool)) public cidProviders;

    /// @dev Initializes the admins of the Data DAO
    /// @param _admins: List of Admins(account addresses)
    constructor(address[] memory _admins) {
        for (uint8 i = 0; i < _admins.length; ) {
            _setupRole(ADMIN_ROLE, _admins[i]);

            unchecked {
                ++i;
            }
        }
    }

    function fund(bytes memory _cidraw, uint64 amount) public payable {
        require(amount == msg.value);
        require(deals[_cidraw].proposedData.dealState == DealState.Active);
    }

    /// @dev Add a user to the dao
    /// @param _userAddress: cid for which the deal proposal is to be created.
    /// @param _role: role that is to be assigned to the user
    function addUser(address _userAddress, bytes32 _role) internal {
        _setupRole(_role, _userAddress);
        
    }

    /// @dev Creates a new deal proposal. 
    /// @param _cidraw: cid for which the deal proposal is to be created.
    /// @param _size: size of cid
    function createDealProposal(bytes memory _cidraw, uint _size) internal {
       
        DataProposal memory newProposal = DataProposal({
            proposedBy: msg.sender,
            cidraw: _cidraw,
            size: _size,
            dealState: DealState.Proposed
        });

        proposals[_cidraw] = newProposal;

    }
   
    /// @dev Approves or Rejects the proposal - This would enable to govern the data that is stored by the DAO 
    /// @param _cidraw: cid of the proposal
    /// @param _choice: decision of the DAO on the proposal
    function approveOrRejectDealProposal(bytes memory _cidraw, DealState _choice) internal {
        require(_choice == DealState.Passed || _choice == DealState.Rejected);
        deals[_cidraw].proposedData.dealState = _choice;
    }

    /// @dev Activate the deal
    /// @param _networkDealID: Deal ID generated after the deal is created on Filecoin Network 
    function activateDeal(uint64 _networkDealID, uint _replicas, uint256 _storageFees, uint256 _dealDurationInDays) internal returns(uint64) {
        MarketTypes.GetDealDataCommitmentReturn memory commitmentRet = MarketAPI.getDealDataCommitment(MarketTypes.GetDealDataCommitmentParams({id: _networkDealID}));
        MarketTypes.GetDealProviderReturn memory providerRet = MarketAPI.getDealProvider(MarketTypes.GetDealProviderParams({id: _networkDealID}));
        // MarketTypes.GetDealActivationReturn memory activationRet = MarketAPI.getDealActivation(MarketTypes.GetDealActivationParams({id: _networkDealID}));
        MarketTypes.GetDealClientReturn memory clientRet = MarketAPI.getDealClient(MarketTypes.GetDealClientParams({id: _networkDealID}));
        
        authorizeDealData(commitmentRet.data, providerRet.provider, commitmentRet.size);
       
        // Activate the deal
        proposals[commitmentRet.data].dealState = DealState.Active;

        Deal memory newDeal = Deal({
            proposedData: proposals[commitmentRet.data],
            replicas: _replicas,
            storageFees: _storageFees,
            dealStartBlockStamp: block.timestamp,
            dealDurationInDays: _dealDurationInDays
        });

        deals[commitmentRet.data] = newDeal;
        return clientRet.client;
    }

    /// @dev Checks if the provider is already storing the CID
    /// @param _cidraw: cid of the proposal
    /// @param _provider: provider credential
    function policyOK(bytes memory _cidraw, uint64 _provider) internal view returns (bool) {
        bool alreadyStoring = cidProviders[_cidraw][_provider];
        return !alreadyStoring;
    }

    /// @dev Checks if the Deal is valid 
    /// @param _cidraw: cid of the proposal
    /// @param _provider: provider credential
    /// @param _size: size of the cred
    function authorizeDealData(bytes memory _cidraw, uint64 _provider, uint _size) internal {
        // Check if the deal proposal was passsed
        require(deals[_cidraw].proposedData.dealState == DealState.Passed);
        // Check if the deal dataset size match
        require(deals[_cidraw].proposedData.size == _size, "data size must match expected");
        require(policyOK(_cidraw, _provider), "deal failed policy check: has provider already claimed this cid?");
        // require(_activationStatus == 1, "deal not activated");
        cidProviders[_cidraw][_provider] = true;
    }

    /// @dev Once the deal is expired the SP can withdraw the rewards
    /// @param _networkDealID: Deal ID generated after the deal is created on Filecoin Network 
    function withdrawReward(uint64 _networkDealID) internal {
        MarketTypes.GetDealDataCommitmentReturn memory commitmentRet = MarketAPI.getDealDataCommitment(MarketTypes.GetDealDataCommitmentParams({id: _networkDealID}));
        MarketTypes.GetDealClientReturn memory clientRet = MarketAPI.getDealClient(MarketTypes.GetDealClientParams({id: _networkDealID}));
        
        require(getDealState(commitmentRet.data) == DealState.Expired);
        reward(clientRet.client, deals[commitmentRet.data].storageFees);
    }

    /// @dev Returns current state of the deal
    /// @param _cidraw: Id of the cred.
    function getDealState(bytes memory _cidraw) public view returns (DealState) {

        if(deals[_cidraw].proposedData.dealState == DealState.Active && (block.timestamp.sub(deals[_cidraw].dealStartBlockStamp)).div(1 days) >= deals[_cidraw].dealDurationInDays) {
            return DealState.Expired;
        } else {
            return deals[_cidraw].proposedData.dealState;
        }

    }
    

}