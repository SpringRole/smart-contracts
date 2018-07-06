pragma solidity ^0.4.19;

contract Attestation {

    event Attest(address _address,string _type,string _data);

    function write(string _type,string _data) public returns (bool) {
        Attest(msg.sender,_type,_data);
        return true;
    }
}
