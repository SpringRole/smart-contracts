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
contract SkillStorage is Ownable {
   /**
     The struct  for skills,endorsements etc...
    */
    struct endorse{
       string done_by;
       string data;
    }
    struct skillStructure {
        string skill_id;
        string data;
    }
    //mapping to check for entity to skill
    mapping(string=>mapping(uint256=>skillStructure)) userToSkills;
    mapping(string=>uint256) userSkillsCounter;
    //mapping for keeping endorsements
    mapping(string=>mapping(uint256=>endorse))  endorsements;
    mapping(string=>uint256)  endorsementCounter;
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
    //function to add skill/update the skill mapping
   function addSkill(string uid,string skill_id,uint256 count,string data) checkOwner(msg.sender) public {
       userToSkills[uid][count]=skillStructure(skill_id,data);
   }
   //function to get skill from user id
   function getSkillCounter(string uid) public view returns(uint256) {
       return userSkillsCounter[uid];
   }
   //function to endorse by any user
   function endorseByUser(string uid1,string skill_id,uint256 count,string data) checkOwner(msg.sender) public {
       endorsements[skill_id][count]=endorse(uid1,data);
   }
   //function get endorsement counter
   function getEndorsementCounter(string skill_id) public view returns(uint256) {
       return endorsementCounter[skill_id];
   }
   //function to get endorsements pagination
   function getPaginationResults(string skill_id,uint256 index) public view returns(string,string) {
       return (endorsements[skill_id][index].done_by,endorsements[skill_id][index].data);
   }
   //function to delete skill
   //..........Logic behind delete..........//////////
   //find the corresponding index to the skill_id then pass it on to this function from the original skill contract
   function deleteSkill(uint256 index,string uid) checkOwner(msg.sender) public {
       delete userToSkills[uid][index];
   }
   
}