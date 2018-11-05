pragma solidity ^0.4.24;

contract Attestation {

    event Attest(address _address,string _type,string _data);

    function write(string _type,string _data) public returns (bool) {
        emit Attest(msg.sender,_type,_data);
        return true;
    }
}
