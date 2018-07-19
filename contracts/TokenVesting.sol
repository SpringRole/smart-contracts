pragma solidity ^0.4.19;
import "./SPRINGToken_Upgrade.sol";


contract TokenVesting is Ownable {
    using SafeMath for uint256;
    uint256 public TotalSupply;
    event Released(uint256 amount);
    event VestingSet(address _beneficiary,uint256 _start,uint256 _cliff,uint256 _duration,uint256 VestingAmount,bool _revocable);
    event VestingRevoke(address _beneficiary);
    SPRINGToken_Upgrade springtoken;

  struct VestingStructure {
    uint256  cliff;
    uint256  start;
    uint256  duration;
    uint256  VestedAmount;
    bool revocable;
  }
  
  mapping (address => uint256) public released;
  mapping (address => bool) public revoked;
  mapping(address => VestingStructure) mapToStructure;
  function TokenVesting(address _token){
    springtoken=SPRINGToken_Upgrade(_token);
  }
  //function to set the total balance
  function setSupply(uint256 _supp) public onlyOwner {
       TotalSupply=_supp;
  }
   /**
   * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
   * _beneficiary, gradually in a linear fashion until _start + _duration. By then all
   * of the balance will have vested.
   * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
   * @param _cliff duration in seconds of the cliff in which tokens will begin to vest
   * @param _start the time (as Unix time) at which point vesting starts 
   * @param _duration duration in seconds of the period in which the tokens will vest
   * @param _revocable whether the vesting is revocable or not
   */
   // beneficiary of tokens after they are released
  
  function SetVesting(address _beneficiary,uint256 _start,uint256 _cliff,uint256 _duration,uint256 _Vamount,bool _revocable) public onlyOwner returns(bool) {
    require(_beneficiary != address(0));
    require(_cliff <= _duration);
    if(_start==0) _start=now;
    _cliff=_cliff.add(_start);
    mapToStructure[_beneficiary]=VestingStructure(_cliff,_start,_duration,_Vamount,_revocable);
    //VestingSet(_beneficiary,_start,_cliff,_duration,_revocable);
    return true;
  }
  //function to see the vesting schedule for an address
  //@param beneficiary address
  function VestingSchedule(address _add) public view returns(uint256,uint256,uint256,uint256,bool) {
    uint256 cliff=mapToStructure[_add].cliff;
    uint256 start=mapToStructure[_add].start;
    uint256 duration=mapToStructure[_add].duration;
    uint256 VestedAmount=mapToStructure[_add].VestedAmount;
    bool revocable=mapToStructure[_add].revocable;
    return(cliff,start,duration,VestedAmount,revocable);
  }

  function release() public {
    uint256 unreleased = releasableAmount(msg.sender);
    require(unreleased > 0&&revoked[msg.sender]==false);
    released[msg.sender] = released[msg.sender].add(unreleased);
    require(mapToStructure[msg.sender].VestedAmount.sub(released[msg.sender])>=0);
    //to transfer tokens
    springtoken.transfer(msg.sender, unreleased);
    Released(unreleased);
  }

   function revokeVesting(address _beneficiary) public onlyOwner returns (bool) {
    require(_beneficiary != address(0));
    require(mapToStructure[_beneficiary].revocable==true);
    revoked[_beneficiary]=true;
    released[_beneficiary] = released[_beneficiary].add(releasableAmount(_beneficiary));
    springtoken.transfer(_beneficiary,releasableAmount(_beneficiary));
    VestingRevoke(_beneficiary);
    return true;
  }

   
  function releasableAmount(address _add) public view returns (uint256) {
    return vestedAmount(_add);
  }

  function vestedAmount(address _beneficiary) public view returns (uint256) {

    uint256 totalBalance = mapToStructure[_beneficiary].VestedAmount;
    if (block.timestamp < mapToStructure[_beneficiary].cliff&&revoked[_beneficiary]==false) {
      return 0;
    } else if (block.timestamp >= mapToStructure[_beneficiary].start.add(mapToStructure[_beneficiary].duration) || revoked[_beneficiary]) {
      return totalBalance;
    } else {
      return totalBalance.mul(block.timestamp.div(mapToStructure[_beneficiary].duration.mul(12)));
    }
  }
}