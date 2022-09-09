pragma solidity ^0.4.8;


contract DocumentManagement {

    mapping (address => string[]) documents;
    mapping (address => string[]) descriptions;

    event DocumentAdded(string hash, string description, uint indexed id);

    function DocumentManagement() {

    }

    function addDocument(string _hash, string _description) returns (bool succcess) {
      uint length = getDocumentsLength();
      if (hashExists(msg.sender, _hash)) {
            return false;
      }

      documents[msg.sender].push(_hash);
      descriptions[msg.sender].push(_description);

      DocumentAdded(_hash, _description, length);

      return true;
    }

    function getDocumentsLength() returns (uint length) {
        return documents[msg.sender].length;
    }

    function hashExists(address _user, string _hash) internal returns (bool success) {
        for (uint i = 0; i < documents[_user].length; i++) {
            if (stringsEqual(documents[_user][0], _hash)) {
                return true;
            }
        }

        return false;
    }

    function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
        bytes storage a = bytes(_a);
        bytes memory b = bytes(_b);
        if (a.length != b.length)
        return false;
        // @todo unroll this loop
        for (uint i = 0; i < a.length; i ++)
        if (a[i] != b[i])
        return false;
        return true;
    }

    function getDocument(uint _index) returns (string hash, string description) {
        return (documents[msg.sender][_index], descriptions[msg.sender][_index]);
    }

}
