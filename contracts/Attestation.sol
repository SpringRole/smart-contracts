pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "tabookey-gasless/contracts/RelayRecipient.sol";


/**
 * Attestation contract to enter event data for all attestations
 */
contract Attestation is Ownable, RelayRecipient {

    event Attest(address _address, string _type, string _data);
    event AttestByOwner(string _address, string _type, string _data);

    mapping (address => bool) public relays_whitelist;
    
    address public blacklisted;

    constructor(RelayHub rhub) public {
        init_relay_hub(rhub);
    }

    /**
     * Function use by user to attest
     */
    function write(string _type, string _data) public returns (bool) {
        emit Attest(get_sender(), _type, _data);
        return true;
    }

    /**
     * Function use by DApp owner to be committed in case of data migration
     */
    function writeByOwner(string _type, string _data, string _address) public onlyOwner returns (bool) {
        emit AttestByOwner(_address, _type, _data);
        return true;
    }

    function deposit() public payable {
        get_relay_hub().depositFor.value(msg.value)(address(this));
    }

    function withdraw() public onlyOwner {
        uint balance = get_relay_hub().balances(address(this));
        get_relay_hub().withdraw(balance);
        msg.sender.transfer(balance);
    }

    function accept_relayed_call(
        address relay,
        address from,
        bytes memory, /*encoded_function*/
        uint, /*gas_price*/
        uint /*transaction_fee*/
    ) 
        public view returns(uint32)
    {
        if (relays_whitelist[relay]) return 0;
        if (from == blacklisted) return 3;
        return 0;
    }
    
    function post_relayed_call(
        address, /*relay*/
        address, /*from*/
        bytes, /*encoded_function*/
        bool, /*success*/
        uint, /*used_gas*/
        uint /*transaction_fee*/
    ) 
        public
    {
        //TODO: Implement anything post relay call if needed.
    }
}
