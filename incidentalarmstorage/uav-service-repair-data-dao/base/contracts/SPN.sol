// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/Base64Upgradeable.sol";

import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";

contract SPN_Factory is ERC721Upgradeable, ERC721BurnableUpgradeable, ERC721URIStorageUpgradeable, ERC721HolderUpgradeable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using StringsUpgradeable for uint256;

    CountersUpgradeable.Counter private _tokenIds;

    ITablelandTables private _tableland;

    string private _baseURIString;
    string private _metadataTable;
    uint256 private _metadataTableId;
    string private _tablePrefix;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory baseURI, address registry) public initializer {
        __ERC721_init("SPNDAO", "SPN");
        __ERC721URIStorage_init();
        __ERC721Holder_init();
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _baseURIString = baseURI;
        _tablePrefix = "SPN_DATA";

        _tableland = ITablelandTables(registry);
        _metadataTableId = _tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(
                "id integer primary key,"
                "address text,"
                "cid text,"
                "symkey text,"
                "time text",
                _tablePrefix
            )
        );
        _metadataTable = string.concat(_tablePrefix, "_", Strings.toString(block.chainid), "_", Strings.toString(_metadataTableId));
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, string memory cid, string memory symkey) public returns (uint256) {
        uint256 newItemId = _tokenIds.current();

        string memory query;
        {
            query = string.concat(
                Strings.toString(newItemId), // Convert to a string
                ",",
                SQLHelpers.quote(Strings.toHexString(to)),
                ",",
                SQLHelpers.quote(cid),
                ",",
                SQLHelpers.quote(symkey),
                ",",
                SQLHelpers.quote(Strings.toString(block.timestamp))
            );
        }

        _tableland.runSQL(
            address(this),
            _metadataTableId,
            SQLHelpers.toInsert(
                _tablePrefix, // prefix
                _metadataTableId, // table id
                "id,address,cid,symkey,time", // column names
                query // values
            )
        );

        _safeMint(to, newItemId, "");
        _tokenIds.increment();
        return newItemId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIString;
    }

    function metadataURI() public view returns (string memory) {
        string memory base = _baseURI();
        return string.concat(base, "SELECT%20*%20FROM%20", _metadataTable);
    }

    function userBurn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this SBT");

        _tableland.runSQL(
            address(this),
            _metadataTableId,
            SQLHelpers.toDelete(
                _tablePrefix, // prefix
                _metadataTableId, // table id
                string.concat("id = ", Strings.toString(tokenId),";")
            )
        );

        _burn(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override whenNotPaused {
        require(from == address(0) || to == address(0), "This a soulbound token");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _authorizeUpgrade(address) internal view override onlyOwner {}

    // The following functions are overrides required by Solidity.
    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
