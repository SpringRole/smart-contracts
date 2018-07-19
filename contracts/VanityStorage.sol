pragma solidity ^0.4.18;
/*
** The storage contract for vanityURL_Upgradable contract
** Storage contract remains same even when logic of vanity contract is changed
*/
contract Ownable2 {
  address public owner;
  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable2() {
    owner = msg.sender;
  }
   /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner2() {
    require(msg.sender == owner);
    _;
  }
}

//The contract keeps track of storage
contract VanityStorage is Ownable2 {
  mapping(address => bool) Access_allowed;
  event Check(address add);
  //to check that the request is actually coming from the vanity contract
  modifier checkVanity(address _add) {
    require(Access_allowed[_add]==true);
     _;
  }
  // This declares a state variable that mapping for vanityURL to address
  mapping (string => address) vanity_address_mapping;
  // This declares a state variable that mapping for address to vanityURL
  mapping (address => string ) address_vanity_mapping;
  // This declares a state variable that mapping for vanityURL to Springrole ID
  mapping (string => string) vanity_springrole_id_mapping;
  // This declares a state variable that mapping for Springrole ID to vanityURL
  mapping (string => string) springrole_id_vanity_mapping;
   
   //to set the contract address
   function allowAccess(address newAddr) onlyOwner2 public {
     Access_allowed[newAddr]=true;
   }

  //function to retrieve address from vanity url
    function retrieveWalletForVanity(string _vanity_url) constant public returns (address) {
    return vanity_address_mapping[_vanity_url];
  }
  //function to set vanity url and address mapping
  function setWalletForVanity(address _address,string _vanity_url) checkVanity(msg.sender) public {
      vanity_address_mapping[_vanity_url]=_address;
  }
  /* function to retrive vanity url from address */
  function retrieveVanityForWallet(address _address) constant public returns (string) {
    return address_vanity_mapping[_address];
  }
  //function to set address and vanity url
  function setVanityForWallet(address _address,string vanity_url) checkVanity(msg.sender) public {
      address_vanity_mapping[_address] = vanity_url;
  }
  /* function to retrive wallet springrole id from vanity url */
  function retrieveSpringroleIdForVanity(string _vanity_url) constant public returns (string) {
    return vanity_springrole_id_mapping[_vanity_url];
  }
  /* function to set wallet springrole id from vanity url */
  function setSpringroleIdForVanity(string _vanity_url,string springroleId) checkVanity(msg.sender) public {
    vanity_springrole_id_mapping[_vanity_url]=springroleId;
  }

  /* function to retrive vanity url from address */
  
  function retrieveVanityForSpringroleId(string _springrole_id) constant public returns (string) {
    return springrole_id_vanity_mapping[_springrole_id];
  }
  /* function to set vanity url from address */
  function setVanityForSpringroleId(string _springrole_id,string vanity_url) checkVanity(msg.sender) public {
    springrole_id_vanity_mapping[_springrole_id] = vanity_url;
  }
  //function to delete address vanity mapping
  function deleteWalletVanityMapping(address _add) checkVanity(msg.sender) public {
    delete address_vanity_mapping[_add];
  }
  //function to delete vanity address mapping
  function deleteVanityWalletMapping(string vanity) checkVanity(msg.sender) public {
    delete vanity_address_mapping[vanity];
  }
  //function to delete springroleId vanity mapping
  function deleteSpringVanityMapping(string vanity) checkVanity(msg.sender) public {
    delete springrole_id_vanity_mapping[vanity_springrole_id_mapping[vanity]];
  }
  //function to delete vanity springrole id mapping 
  function deleteVanitySpringMapping(string vanity) checkVanity(msg.sender) public {
    delete vanity_springrole_id_mapping[vanity];
  }
}