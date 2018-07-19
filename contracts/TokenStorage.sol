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
contract TokenStorage is Ownable {
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
   function allowAccess(address newAddr) onlyOwner public {
     Access_allowed[newAddr]=true;
   }
    //function to get balance from address
    function getBalanceFromAddress(address _add) constant public returns(uint256) {
        return balances[_add];
    }
    //function to get amount from addresses
    function getAllowedAmount(address _add1,address _add2) constant public returns(uint256) {
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