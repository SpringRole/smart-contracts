pragma solidity ^0.4.19;
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
contract TokenStorage is Ownable2 {
    //to keep track of balances
    mapping (address => uint256) public balances;
    //to keep track of allowed addresses
    mapping (address => mapping (address => uint256)) public allowed;
    //mapping to allow access to only some addresses
    mapping(address => bool) Access_allowed;
     //to check that the request is actually coming from the vanity contract
    modifier checkVanity(address _add) {
        require(Access_allowed[_add]==true);
        _;
    }
    //to set the contract address
   function allowAccess(address newAddr) onlyOwner2 public {
     Access_allowed[newAddr]=true;
   }
    //function to get balance from address
    function getBalanceFromAddress(address _add) constant public returns(uint256) {
        return balances[_add];
    }
    //function to get amount from addresses
    function getAmountFromAddress(address _add1,address _add2) constant public returns(uint256) {
        return allowed[_add1][_add2];
    }
    //function to set balance from address
    function setBalance(address _add,uint256 amt) checkVanity(msg.sender) public {
        balances[_add]=amt;
    }
    //function to set amount allowed
    function setAllowedAmount(address _add1,address _add2,uint256 amt) checkVanity(msg.sender) public {
        allowed[_add1][_add2]=amt;
    }
}