pragma solidity ^0.4.19;
import "./VanityStorage.sol";
/* The upgradable version of vanityURL contract*/

/**
* Contract for Vanity URL on SpringRole
* This one is the upgradable contract
* Go to beta.springrole.com to try this out!
*/

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
   * newOwner The address to transfer ownership to.
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
   The address of the vanity storage contract
 * Go to https://beta.springrole.com to reserve.
 */
contract VanityURL_Upgrade is Ownable,Pausable {
  VanityStorage vanityStorageaddr;
   
  event VanityReserved(address _to, string _vanity_url);
  event VanityTransfered(address _to,address _from, string _vanity_url);
  event VanityReleased(string _vanity_url);

  //constructor
  //The address of vanity storage address
     function VanityURL_Upgrade(address vanity_store) {
         vanityStorageaddr=VanityStorage(vanity_store);
     }
  
  /*
    function to reserve vanityURL
    1. Checks if vanity is check is valid
    2. Checks if address has already a vanity url
    3. check if vanity url is used by any other or not
    4. Check if vanity url is present in any other spingrole id
    5. Transfer the token
    6. Update the mapping variables
  */
  function reserve(string _vanity_url,string _springrole_id) whenNotPaused public {
    _vanity_url = _toLower(_vanity_url);
    require(vanityStorageaddr.retrieveWalletForVanity(_vanity_url)==address(0x0));
    require(bytes(vanityStorageaddr.retrieveVanityForWallet(msg.sender)).length == 0);
    require(bytes(vanityStorageaddr.retrieveVanityForSpringroleId(_springrole_id)).length == 0);
    /* adding to vanity address mapping */
    vanityStorageaddr.setWalletForVanity(msg.sender,_vanity_url);
    /* adding to vanity springrole id mapping */
    vanityStorageaddr.setSpringroleIdForVanity(_vanity_url,_springrole_id);
    /* adding to springrole id vanity mapping */
    vanityStorageaddr.setVanityForSpringroleId(_springrole_id,_vanity_url);
    /* adding to address vanity mapping */
    vanityStorageaddr.setVanityForWallet(msg.sender,_vanity_url);
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
    for (uint i =0; i< length; i++) {
      var c = bytes(_vanity_url)[i];
      if ((c < 48 ||  c > 122 || (c > 57 && c < 65) || (c > 90 && c < 97 )) && (c != 95))
        return false;
    }
    return true;
  }
  //this is to retreive wallet address
  function retrieveWallet(string vanity) constant public returns(address) {
   return vanityStorageaddr.retrieveWalletForVanity(vanity);
  }
  //this is to retriev the spring_role_id from storage
  function retrieveSpringId(string vanity) constant public returns(string) {
    return vanityStorageaddr.retrieveSpringroleIdForVanity(vanity);
  }
  //this is to retrive vanity from wallet
  function retrieveVanity(address _address) constant public returns(string) {
    return vanityStorageaddr.retrieveVanityForWallet(_address);
  }
   /*
  function to transfer ownership for Vanity URL
  */
  function transferOwnershipForVanityURL(address _to) whenNotPaused public {
    require(bytes(vanityStorageaddr.retrieveVanityForWallet(_to)).length == 0);
    require(bytes(vanityStorageaddr.retrieveVanityForWallet(msg.sender)).length != 0);
    vanityStorageaddr.setVanityForWallet(_to,string(vanityStorageaddr.retrieveVanityForWallet(msg.sender)));
    vanityStorageaddr.setWalletForVanity(_to,string(vanityStorageaddr.retrieveVanityForWallet(msg.sender)));
    //vanity_address_mapping[address_vanity_mapping[msg.sender]] = _to;
    VanityTransfered(msg.sender,_to,string(vanityStorageaddr.retrieveVanityForWallet(_to)));
    vanityStorageaddr.deleteWalletVanityMapping(msg.sender);
  }
  /*
     To release vanity by owner
  */
  function releaseVanityUrl(string _vanity_url) whenNotPaused onlyOwner public {
    require(vanityStorageaddr.retrieveWalletForVanity(_vanity_url)!=address(0x0));
    /* delete from address mapping */
    vanityStorageaddr.deleteWalletVanityMapping(msg.sender);
    /* delete from vanity mapping */
    vanityStorageaddr.deleteVanityWalletMapping(_vanity_url);
    /* delete from springrole id vanity mapping */
    vanityStorageaddr.deleteSpringVanityMapping(_vanity_url);
    /* delete from vanity springrole id mapping */
    vanityStorageaddr.deleteVanitySpringMapping(_vanity_url);
    /* sending VanityReleased event */
    VanityReleased(_vanity_url);
  }
  /*
  function to transfer ownership for Vanity URL by Owner (Upgraded function)
  */
  function reserveVanityURLByOwner(address _to,string _vanity_url,string _springrole_id,string _data) whenNotPaused onlyOwner public {
      _vanity_url = _toLower(_vanity_url);
      require(checkForValidity(_vanity_url));
      /* check if vanity url is being used by anyone */
      if(vanityStorageaddr.retrieveWalletForVanity(_vanity_url)  != address(0x0))
      {
        /* Sending Vanity Transfered Event */
        VanityTransfered(vanityStorageaddr.retrieveWalletForVanity(_vanity_url),_to,_vanity_url);
        /* delete from address mapping */
        vanityStorageaddr.deleteWalletVanityMapping(vanityStorageaddr.retrieveWalletForVanity(_vanity_url));
        /* delete from vanity mapping */
        vanityStorageaddr.deleteVanityWalletMapping(_vanity_url);
        /* delete from springrole id vanity mapping */
        vanityStorageaddr.deleteVanitySpringMapping(_vanity_url);
        /* delete from vanity springrole id mapping */
        vanityStorageaddr.deleteSpringVanityMapping(_vanity_url);
      }
      else
      {
        /* sending VanityReserved event */
        VanityReserved(_to, _vanity_url);
      }
      /* add new address to mapping */
      vanityStorageaddr.setWalletForVanity(_to,_vanity_url);
      vanityStorageaddr.setVanityForWallet(_to,_vanity_url);
      vanityStorageaddr.setSpringroleIdForVanity(_vanity_url,_springrole_id);
      vanityStorageaddr.setVanityForSpringroleId(_springrole_id,_vanity_url);
  }
   /*
  function to change Vanity URL
    1. Checks whether vanity URL is check is valid
    2. Checks whether springrole id has already has a vanity
    3. Checks if address has already a vanity url
    4. check if vanity url is used by any other or not
    5. Check if vanity url is present in reserved keyword
    6. Update the mapping variables
  */

  function changeVanityURL(string _vanity_url, string _springrole_id) whenNotPaused public {
    require(bytes(vanityStorageaddr.retrieveVanityForWallet(msg.sender)).length != 0);
    require(bytes(vanityStorageaddr.retrieveVanityForSpringroleId(_springrole_id)).length == 0);
    _vanity_url = _toLower(_vanity_url);
    require(checkForValidity(_vanity_url));
    require(vanityStorageaddr.retrieveWalletForVanity(_vanity_url) == address(0x0));
    vanityStorageaddr.setWalletForVanity(msg.sender,_vanity_url);
    vanityStorageaddr.setVanityForWallet(msg.sender,_vanity_url);
    vanityStorageaddr.setSpringroleIdForVanity(_vanity_url,_springrole_id);
    vanityStorageaddr.setVanityForSpringroleId(_springrole_id,_vanity_url);
    VanityReserved(msg.sender, _vanity_url);
  }
   /*
    function to kill contract
  */

  function kill() onlyOwner {
    selfdestruct(owner);
  }

  /*
    transfer eth recived to owner account if any
  */
  function() payable {
    owner.transfer(msg.value);
  }
}