pragma solidity ^0.4.19;
import "./AttestStorage.sol";
contract Attestation {
    AttestStorage storageAddress;
    event claimAdded(string _by,string ref_id,string claim);
    event attestDone(string _for,string _by,string ref_id,uint256 level);
    //constructor to set storage address
    function Attestation (address _addr) {
        storageAddress=AttestStorage(_addr);
    }
    //function to claim | can be called by anyone
    function setClaim(string uid,string ref_id,string _claim) public {
        storageAddress.setClaimMapping(uid,ref_id,_claim);
        claimAdded(uid,ref_id,_claim);
    }
    //function to attest or verify a claim
    function attesting(string uid1,string uid2,string ref_id,uint256 _level) public {
      uint256 count = storageAddress.getCounter(ref_id);
      require(keccak256(uid1)!=keccak256(uid2)&&keccak256(storageAddress.getClaimDoneByUser(uid1,ref_id))!=keccak256(""));
      count++;
      storageAddress.setAttestingsMapping(uid1,uid2,ref_id,_level,count);
      storageAddress.setAttestCounterMapping(ref_id,count);
      if(storageAddress.getClaimLevel(uid1,ref_id)<_level){
          storageAddress.setClaimLevel(uid1,ref_id,_level);
      }
        attestDone(uid1,uid2,ref_id,_level);
    }
    //function to get pagination results
    function  getAttestResults(uint256 index,string ref_id) public view returns(string,string,uint256,bool,string) {
        return storageAddress.getPaginationResults(index,ref_id);
    }
    //function to update any current attribute like work ex,education etc
    function updateAttribute(string uid,string ref_id,string _newclaim) public {
       storageAddress.deleteOldClaim(uid,ref_id);
       setClaim(uid,ref_id,_newclaim);
    }
    
}