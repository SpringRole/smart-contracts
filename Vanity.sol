pragma solidity ^0.4.19;

/**
 * @title Token
 * @dev Simpler version of ERC20 interface
 */
contract Token {
  function transfer(address to, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

contract SRTToken is Token{

  function doTransfer(address _from, address _to, uint256 _value) public returns (bool);

}

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of “user permissions”.
 */

contract Ownable {
  address public owner;


  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() {
    owner = msg.sender;
  }


  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }


  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) onlyOwner public {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */

contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;


  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() onlyOwner whenNotPaused public {
    paused = true;
    Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() onlyOwner whenPaused public {
    paused = false;
    Unpause();
  }
}


/**
 * @title VanityURL
 * @dev The VanityURL contract provides functionality to reserve vanity URLs.
 * Go to https://beta.springrole.com to reserve.
 */


contract VanityURL is Ownable,Pausable {

  // This declares a state variable that would store the contract address
  SRTToken public tokenAddress;
  // This declares a state variable that would store mapping for reserved _keyword
  mapping (string => uint) reservedKeywords;
  // This declares a state variable that mapping for vanityURL to address
  mapping (string => address) vanity_address_mapping;
  // This declares a state variable that mapping for address to vanityURL
  mapping (address => string ) address_vanity_mapping;
  // This declares a state variable that stores pricing
  uint256 public reservePricing;
  // This declares a state variable address to which token to be transfered
  address public transferTokenTo;

  /*
    constructor function to set token address & Pricing for reserving and token transfer address
   */
  function VanityURL(address _tokenAddress, uint256 _reservePricing, address _transferTokenTo){
    tokenAddress = SRTToken(_tokenAddress);
    reservePricing = _reservePricing;
    transferTokenTo = _transferTokenTo;
  }

  event VanityReserved(address _from, string _vanity_url);
  event VanityTransfered(address _to,address _from, string _vanity_url);

  /* function to update Token address */
  function updateTokenAddress (address _tokenAddress) onlyOwner public {
    tokenAddress = SRTToken(_tokenAddress);
  }

  /* function to update transferTokenTo */
  function updateTokenTransferAddress (address _transferTokenTo) onlyOwner public {
    transferTokenTo = _transferTokenTo;
  }

  /* function to add reserve keyword */
  function addReservedKeyword (string _keyword) onlyOwner public {
    reservedKeywords[_keyword] = 1;
  }


  /* 
   function to remove reserved keyword 
  */
  function removeReservedKeyword (string _keyword) onlyOwner public {
    delete(reservedKeywords[_keyword]);
  }

  /* function to set reserve pricing */
  function setReservePricing (uint256 _reservePricing) onlyOwner public {
    reservePricing = _reservePricing;
  }

  /* function to retrive wallet address from vanity url */
  function retrieveWalletForVanity(string _vanity_url) constant public returns (address) {
    return vanity_address_mapping[_vanity_url];
  }

  /* function to retrive vanity url from address */
  function retrieveVanityForWallet(address _address) constant public returns (string) {
    return address_vanity_mapping[_address];
  }

  /*
    function to reserve vanityURL
    1. Checks if vanity is check is valid
    2. Checks if address has already a vanity url
    3. check if vanity url is used by any other or not
    4. Check if vanity url is present in reserved keyword
    5. Transfer the token
    6. Update the mapping variables
  */
  function reserve(string _vanity_url) whenNotPaused public {
    _vanity_url = _toLower(_vanity_url);
    require(checkForValidity(_vanity_url));
    require(vanity_address_mapping[_vanity_url]  == address(0x0));
    require(bytes(address_vanity_mapping[msg.sender]).length == 0);
    require(reservedKeywords[_vanity_url] != 1);
    require(tokenAddress.doTransfer(msg.sender,transferTokenTo,reservePricing));
    vanity_address_mapping[_vanity_url] = msg.sender;
    address_vanity_mapping[msg.sender] = _vanity_url;
    VanityReserved(msg.sender, _vanity_url);
  }

  /*
  function to make lowercase
  */

  function _toLower(string str) internal returns (string) {
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

  /*
  function to verify vanityURL
  1. Minimum length 4
  2.Maximum lenght 200
  3.Vanity url is only alphanumeric
   */
  function checkForValidity(string _vanity_url) returns (bool) {
    uint length =  bytes(_vanity_url).length;
    require(length >= 4 && length <= 200);
    for (uint i =0; i< length; i++){
      var c = bytes(_vanity_url)[i];
      if (c < 48 ||  c > 122 || (c > 57 && c < 65) || (c > 90 && c < 97 ) )
        return false;
    }
    return true;
  }

  /*
  function to change Vanity URL
    1. Checks whether vanity URL is check is valid
    2. Checks if address has already a vanity url
    3. check if vanity url is used by any other or not
    4. Check if vanity url is present in reserved keyword
    5. Update the mapping variables
  */

  function changeVanityURL(string _vanity_url) whenNotPaused public {
    require(bytes(address_vanity_mapping[msg.sender]).length != 0);
    _vanity_url = _toLower(_vanity_url);
    require(checkForValidity(_vanity_url));
    require(vanity_address_mapping[_vanity_url]  == address(0x0));
    require(reservedKeywords[_vanity_url] != 1);
    vanity_address_mapping[_vanity_url] = msg.sender;
    address_vanity_mapping[msg.sender] = _vanity_url;
    VanityReserved(msg.sender, _vanity_url);
  }

  /*
  function to transfer ownership for Vanity URL
  */
  function transferOwnershipForVanityURL(address _to) whenNotPaused public {
    require(bytes(address_vanity_mapping[_to]).length == 0);
    require(bytes(address_vanity_mapping[msg.sender]).length != 0);
    address_vanity_mapping[_to] = address_vanity_mapping[msg.sender];
    vanity_address_mapping[address_vanity_mapping[msg.sender]] = _to;
    VanityTransfered(msg.sender,_to,address_vanity_mapping[msg.sender]);
    delete(address_vanity_mapping[msg.sender]);
  }

  /*
  function to transfer ownership for Vanity URL by Owner
  */
  function reserveVanityURLByOwner(address _to,string _vanity_url) whenNotPaused onlyOwner public {
      _vanity_url = _toLower(_vanity_url);
      require(checkForValidity(_vanity_url));
      require(reservedKeywords[_vanity_url] != 1);
      /* check if vanity url is being used by anyone */
      if(vanity_address_mapping[_vanity_url]  != address(0x0))
      {
        /* delete from address mapping */
        delete(address_vanity_mapping[vanity_address_mapping[_vanity_url]]);
        /* delete from vanity mapping */
        delete(vanity_address_mapping[_vanity_url]);
      }
      /* add new address to mapping */
      vanity_address_mapping[_vanity_url] = _to;
      address_vanity_mapping[_to] = _vanity_url;
      VanityReserved(_to, _vanity_url);
  }

  /*
    function to kill contract
  */

  function kill() onlyOwner {
    suicide(owner);
  }

  /*
    transfer eth recived to owner account if any
  */
  function() payable {
    owner.transfer(msg.value);
  }

}
