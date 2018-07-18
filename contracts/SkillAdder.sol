pragma solidity ^0.4.19;
import "./SkillStorage.sol";
contract SkillAdder {
    SkillStorage sStore;
    event skillAdded(string added_By,string skill_id,string data);
    event skillEndorsed(string added_By,string added_for,string skill_id,string data);
    //constructor to set storage address
    function SkillAdder(address _addr) {
        sStore=SkillStorage(_addr);
    }
    function addSkill(string uid,string skill_id,string data) public {
        uint256 count=sStore.getSkillCounter(uid);
        count++;
        sStore.addSkill(uid,skill_id,count,data);
        skillAdded(uid,skill_id,data);
    }
    function endorse(string skill_id,string uid,string data,string _to) public {
         uint256 count=sStore.getEndorsementCounter(skill_id);
        count++;
        sStore.endorseByUser(uid,skill_id,count,data);
        skillEndorsed(uid,_to,skill_id,data);
    }
    function getEndorseResults(uint256 index,string skill_id) public view returns(string,string) {
        return sStore.getPaginationResults(skill_id,index);
    }
}