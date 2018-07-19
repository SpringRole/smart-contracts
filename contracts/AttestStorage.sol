pragma solidity ^0.4.19;
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
contract AttestStorage is Ownable {
   /**
     The struct  for attestations,claim etc...
    */
    uint256 counter=0;
    struct claimStructure {
        string claim;
        uint256 attest_level;
        bool active;
    }
    struct attestationStructure {
        string data;
        string opposite_party_id;
        uint256 attest_level;
        bool active;
    }
    //mapping for user_id to ref id to struct detail
    mapping(string=>mapping(string=>claimStructure))  claims;
    //mapping for attestor id to user id to detail
    mapping(string=>mapping(uint256=>attestationStructure))  attestations;
    mapping(string=>uint256)   attest_counter;
   //mapping to allow access to only some addresses
    mapping(address => bool) Access_allowed;
     //to check that the request is actually coming from the vanity contract
    modifier checkOwner(address _add) {
        require(Access_allowed[_add]==true);
        _;
    }
    //to set the contract address
   function allowAccess(address newAddr) onlyOwner public {
     Access_allowed[newAddr]=true;
   }

  //function update claim by the user
   function setClaimMapping(string uid,string ref_id,string _claim) checkOwner(msg.sender) public {
       claims[uid][ref_id]=claimStructure(_claim,0,true);
   }
   //function to get current count for a refernce
   function getCounter(string ref_id) public view returns(uint256) {
       return attest_counter[ref_id];
   }
   //function to set attesting mapping
   function setAttestingsMapping(string uid1,string uid2,string ref_id,uint256 _level,uint256 count) checkOwner(msg.sender) public {
        attestations[ref_id][count]=attestationStructure(claims[uid1][ref_id].claim,uid2,_level,true);
   }
   //function to set attest_counter mapping
   function setAttestCounterMapping(string ref_id,uint256 count) checkOwner(msg.sender) public {
       attest_counter[ref_id]=count;
   }
  //get the details through the pagination function
  function getPaginationResults(uint256 index,string ref_id) public view returns(string,string,uint256,bool) {
      require(keccak256(attestations[ref_id][index].opposite_party_id)!=keccak256(""));
      return (attestations[ref_id][index].data,attestations[ref_id][index].opposite_party_id,attestations[ref_id][index].attest_level,attestations[ref_id][index].active);
  }
  //function to get claim attest_level
  function getClaimLevel(string uid1,string ref_id) public view returns(uint256) {
      return claims[uid1][ref_id].attest_level;
  }
  //function to claim done by user
    function getClaimDoneByUser(string uid1,string ref_id) public view returns(string) {
      return claims[uid1][ref_id].claim;
  }
  function setClaimLevel(string uid1,string ref_id,uint256 level) checkOwner(msg.sender) public {
      claims[uid1][ref_id].attest_level=level;
  }
  //function to delete old claim
    function deleteOldClaim(string uid1,string ref_id) checkOwner(msg.sender) public {
      delete claims[uid1][ref_id];
  }
    
}