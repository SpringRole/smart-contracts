pragma solidity ^0.4.19;
import "./VanityStorage.sol";

contract temp {
    VanityStorage vanityStorageaddr;
    function temp(address vanity) {
       vanityStorageaddr=VanityStorage(vanity);
    }
    function reserve(string _vanity_url,string _springrole_id) public {
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
   // VanityReserved(msg.sender, _vanity_url);
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
}