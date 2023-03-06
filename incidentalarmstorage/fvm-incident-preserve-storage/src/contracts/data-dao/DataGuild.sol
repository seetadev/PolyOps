// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./DataDAO.sol";
import "../openzeppelin/contracts/token/ERC721/IERC721.sol";

contract DataGuild is DataDAO {

    IERC721 public membershipNFT;

    // mapping(bytes => mapping(address => uint256)) public fundings;
    // mapping(bytes => uint256) public dealStorageFees;
    mapping(bytes => uint64) public dealClient;

    string public guildURI;

    constructor(address[] memory admins, address _membershipNFT, string  memory _guildURI) DataDAO(admins) {
        membershipNFT = IERC721(_membershipNFT);
        guildURI = _guildURI;
    }

    /// @dev Creates a new deal proposal. 
    /// @param _cidraw: cid for which the deal proposal is to be created.
    /// @param _size: size of cid
    function createDataSetDealProposal(bytes memory _cidraw, uint _size) public payable {
        require(hasRole(MEMBER_ROLE, msg.sender), "Caller is not a minter");
        createDealProposal(_cidraw, _size);
    }

    /// @dev Approves or Rejects the proposal - This would enable to govern the data that is stored by the DAO
    /// @param _cidraw: Id of the cred.
    /// @param _choice: decision of the DAO on the proposal
    function approveOrRejectDataSet(bytes memory _cidraw, DealState _choice, uint64 _fundAmount) public payable {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not a admin");
        approveOrRejectDealProposal(_cidraw, _choice);
        fund(_cidraw, _fundAmount);
    }

    /// @dev Activates the deal
    /// @param _networkDealID: Deal ID generated after the deal is created on Filecoin Network 
    function activateDataSetDeal(uint64 _networkDealID, uint _replicas, uint256 _storageFees, uint256 _dealDurationInDays) public {
        uint64 client = activateDeal(_networkDealID, _replicas, _storageFees, _dealDurationInDays);
        MarketTypes.GetDealDataCommitmentReturn memory commitmentRet = MarketAPI.getDealDataCommitment(MarketTypes.GetDealDataCommitmentParams({id: _networkDealID}));
        dealClient[commitmentRet.data] = client;
    }

    function claimReward(uint64 _networkDealID) public {
        withdrawReward(_networkDealID);
    }

}

