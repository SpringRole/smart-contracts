pragma solidity ^0.4.19;

contract Attestation {

    event Attest(string _entity1,string _entity2,string _type,string _data);

    function write(string _entity1,string _entity2,string _type,string _data) public returns (bool) {
        Attest(_entity1,_entity2,_type,_data);
        return true;
    }
}
