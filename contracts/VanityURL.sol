pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

/**
 * @title VanityURL
 * @dev The VanityURL contract provides functionality to reserve vanity URLs.
 * Go to https://springrole.com to reserve.
 */
contract VanityURL is Ownable, Pausable {//, RelayRecipient {

    // This declares a state variable that mapping for vanityURL to address
    mapping (string => address) private vanity_address_mapping;
    // This declares a state variable that mapping for address to vanityURL
    mapping (address => string ) private address_vanity_mapping;
    // This declares a state variable that mapping for vanityURL to Springrole ID
    mapping (string => string) private vanity_springrole_id_mapping;
    // This declares a state variable that mapping for Springrole ID to vanityURL
    mapping (string => string) private springrole_id_vanity_mapping;

    event VanityReserved(address _to, string _vanity_url);
    event VanityTransfered(address _to, address _from, string _vanity_url);
    event VanityReleased(string _vanity_url);

    /* function to retrive wallet address from vanity url */
    function retrieveWalletForVanity(string _vanity_url) public view returns (address) {
        return vanity_address_mapping[_vanity_url];
    }

    /* function to retrive vanity url from address */
    function retrieveVanityForWallet(address _address) public view returns (string memory) {
        return address_vanity_mapping[_address];
    }

    /* function to retrive wallet springrole id from vanity url */
    function retrieveSpringroleIdForVanity(string _vanity_url) public view returns (string memory) {
        return vanity_springrole_id_mapping[_vanity_url];
    }

    /* function to retrive vanity url from address */
    function retrieveVanityForSpringroleId(string _springrole_id) public view returns (string memory) {
        return springrole_id_vanity_mapping[_springrole_id];
    }

    /**
     * @dev Function to reserve vanityURL
     * 1. Checks if vanity is check is valid
     * 2. Checks if address has already a vanity url
     * 3. check if vanity url is used by any other or not
     * 4. Check if vanity url is present in any other spingrole id
     * 5. Transfer the token
     * 6. Update the mapping variables
     */
    function reserve(string _vanity_url, string _springrole_id) public whenNotPaused {
        //TODO: Function call through trusted relays
        _vanity_url = _toLower(_vanity_url);
        require(checkForValidity(_vanity_url));
        require(vanity_address_mapping[_vanity_url] == address(0x0));
        require(bytes(address_vanity_mapping[msg.sender]).length == 0);
        require(bytes(springrole_id_vanity_mapping[_springrole_id]).length == 0);
        /* adding to vanity address mapping */
        vanity_address_mapping[_vanity_url] = msg.sender;
        /* adding to vanity springrole id mapping */
        vanity_springrole_id_mapping[_vanity_url] = _springrole_id;
        /* adding to springrole id vanity mapping */
        springrole_id_vanity_mapping[_springrole_id] = _vanity_url;
        /* adding to address vanity mapping */
        address_vanity_mapping[msg.sender] = _vanity_url;
        emit VanityReserved(msg.sender, _vanity_url);
    }

    /**
     * @dev Function to change Vanity URL
     * 1. Checks whether vanity URL is check is valid
     * 2. Checks whether springrole id has already has a vanity
     * 3. Checks if address has already a vanity url
     * 4. check if vanity url is used by any other or not
     * 5. Check if vanity url is present in reserved keyword
     * 6. Update the mapping variables
     */
    function changeVanityURL(string _vanity_url, string _springrole_id) public whenNotPaused {
        //TODO: Function call through trusted relays
        require(bytes(address_vanity_mapping[msg.sender]).length != 0);
        require(bytes(springrole_id_vanity_mapping[_springrole_id]).length == 0);
        _vanity_url = _toLower(_vanity_url);
        require(checkForValidity(_vanity_url));
        require(vanity_address_mapping[_vanity_url] == address(0x0));

        vanity_address_mapping[_vanity_url] = msg.sender;
        address_vanity_mapping[msg.sender] = _vanity_url;
        vanity_springrole_id_mapping[_vanity_url] = _springrole_id;
        springrole_id_vanity_mapping[_springrole_id] = _vanity_url;

        emit VanityReserved(msg.sender, _vanity_url);
    }

    /**
     * @dev Function to transfer ownership for Vanity URL
     */
    function transferOwnershipForVanityURL(address _to) public whenNotPaused {
        //TODO: Function call through trusted relays
        require(bytes(address_vanity_mapping[_to]).length == 0);
        require(bytes(address_vanity_mapping[msg.sender]).length != 0);
        address_vanity_mapping[_to] = address_vanity_mapping[msg.sender];
        vanity_address_mapping[address_vanity_mapping[msg.sender]] = _to;
        emit VanityTransfered(msg.sender, _to, address_vanity_mapping[msg.sender]);
        delete (address_vanity_mapping[msg.sender]);
    }

    /** 
     * @dev Function to transfer ownership for Vanity URL by Owner
     */
    function reserveVanityURLByOwner(
        address _to,
        string _vanity_url,
        string _springrole_id,
        string _data
    ) 
        public
        onlyOwner 
        whenNotPaused
    {
        _vanity_url = _toLower(_vanity_url);
        require(checkForValidity(_vanity_url));
        /* check if vanity url is being used by anyone */
        if (vanity_address_mapping[_vanity_url] != address(0x0)) {
            /* Sending Vanity Transfered Event */
            emit VanityTransfered(vanity_address_mapping[_vanity_url], _to, _vanity_url);
            /* delete from address mapping */
            delete (address_vanity_mapping[vanity_address_mapping[_vanity_url]]);
            /* delete from vanity mapping */
            delete (vanity_address_mapping[_vanity_url]);
            /* delete from springrole id vanity mapping */
            delete (springrole_id_vanity_mapping[vanity_springrole_id_mapping[_vanity_url]]);
            /* delete from vanity springrole id mapping */
            delete (vanity_springrole_id_mapping[_vanity_url]);
        } else {
            /* sending VanityReserved event */
            emit VanityReserved(_to, _vanity_url);
        }
        /* add new address to mapping */
        vanity_address_mapping[_vanity_url] = _to;
        address_vanity_mapping[_to] = _vanity_url;
        springrole_id_vanity_mapping[_springrole_id] = _vanity_url;
        vanity_springrole_id_mapping[_vanity_url] = _springrole_id;
    }

    /**
     * @dev Function to release a Vanity URL by Owner
     */
    function releaseVanityUrl(string _vanity_url) public onlyOwner whenNotPaused {
        require(vanity_address_mapping[_vanity_url] != address(0x0));
        /* delete from address mapping */
        delete (address_vanity_mapping[vanity_address_mapping[_vanity_url]]);
        /* delete from vanity mapping */
        delete (vanity_address_mapping[_vanity_url]);
        /* delete from springrole id vanity mapping */
        delete (springrole_id_vanity_mapping[vanity_springrole_id_mapping[_vanity_url]]);
        /* delete from vanity springrole id mapping */
        delete (vanity_springrole_id_mapping[_vanity_url]);
        /* sending VanityReleased event */
        emit VanityReleased(_vanity_url);
    }

    /**
     * @dev Function to kill contract
     */
    function kill() public onlyOwner {
        selfdestruct(owner());
    }

    /**
     * @dev Function to make lowercase
     */
    function _toLower(string str) internal pure returns (string) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // Uppercase character...
            if ((bStr[i] >= 65) && (bStr[i] <= 90)) {
                // So we add 32 to make it lowercase
                bLower[i] = bytes1(int(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    /**
     * @dev Function to verify vanityURL
     * 1. Minimum length 4
     * 2.Maximum lenght 200
     * 3.Vanity url is only alphanumeric
     */
    function checkForValidity(string _vanity_url) internal pure returns (bool) {
        uint length =  bytes(_vanity_url).length;
        require(length >= 4 && length <= 200);
        for (uint i =0; i < length; i++) {
            var c = bytes(_vanity_url)[i];
            if ((c < 48 || c > 122 || (c > 57 && c < 65) || (c > 90 && c < 97)) && (c != 95))
                return false;
        }
        return true;
    }

}
