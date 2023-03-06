// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./openzeppelin/contracts/token/ERC721/ERC721.sol";

contract GuildMembershipNFT is ERC721 {

    uint256 public tokenCount;

    constructor() ERC721("Guild Membership NFT", "GMN") {}

    function mint(address to) public {
        tokenCount = tokenCount + 1;
        _safeMint(to, tokenCount);
    }

}