// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";

// basic non upgradeable contract for testing
contract Basic_SPN_Factory is ERC721Burnable, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    ITablelandTables private _tableland;

    string private _baseURIString = "https://testnets.tableland.network/query?s=";
    string private _metadataTable;
    uint256 private _metadataTableId;
    string private _tablePrefix = "BSF_SPN";

    constructor() ERC721("BASIC_SPN_FACT", "BSF") {
        _tableland = ITablelandTables(0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68); // mumbai tableland registry
        _metadataTableId = _tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(
                "id integer primary key,"
                "address text,"
                "cid text",
                _tablePrefix
            )
        );
        _metadataTable = string.concat(_tablePrefix, "_", Strings.toString(block.chainid), "_", Strings.toString(_metadataTableId));
    }

    function safeMint(address to, string memory cid) public returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _tableland.runSQL(
            address(this),
            _metadataTableId,
            SQLHelpers.toInsert(
                _tablePrefix, // prefix
                _metadataTableId, // table id
                "id,address,cid", // column names
                string.concat(
                    Strings.toString(newItemId), // Convert to a string
                    ",",
                    SQLHelpers.quote(Strings.toHexString(to)),
                    ",",
                    SQLHelpers.quote(cid)
                )
            )
        );

        _safeMint(to, newItemId, "");
        _tokenIds.increment();
        return newItemId;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function metadataURI() public view returns (string memory) {
        string memory base = _baseURI();
        return string.concat(base, "SELECT%20*%20FROM%20", _metadataTable);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIString;
    }

    function userBurn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this SBT");
        _burn(tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 /*tokenId*/, uint256 /*batchSize*/) internal pure override(ERC721) {
        require(from == address(0) || to == address(0), "This a soulbound token");
    }
}
