pragma solidity ^0.5.0;

contract TestPacked {
    int64 public a;
    int64 public b;
    int64 public c;
    int64 public d;

    function unpack (bytes32 x) public {
        d = int64 (bytes8 (x << 192));
        c = int64 (bytes8 (x << 128));
        b = int64 (bytes8 (x << 64));
        a = int64 (bytes8 (x));
    }
}
