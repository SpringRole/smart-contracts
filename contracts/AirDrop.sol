pragma solidity ^0.4.24;


/**
 * @title Token
 * @dev Simpler version of ERC20 interface
 */
contract Token {
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}


contract Ownable {

    address public owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor() public {
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
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0x0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

}


contract AirDrop is Ownable {

    // This declares a state variable that would store the contract address
    Token public tokenInstance;

    /**
     * @dev constructor to set token address
     */
    constructor(address _tokenAddress) public {
        tokenInstance = Token(_tokenAddress);
    }

    /**
     * @dev Payable fallback function to add Ether to the contract
     */
    function() public payable {}

    /**
     * @dev Airdrop function to send tokens to array of address and send Ether to Etherless address
     * @param _address Array of address that will receive Airdrop
     * @param _amount single token amount
     * @param _ethAmount eth amount
     */
    function doAirDrop(
        address[] _address,
        uint256 _amount,
        uint256 _ethAmount
    )
        public
        onlyOwner
        returns (bool)
    {
        uint256 count = _address.length;
        for (uint256 i = 0; i < count; i++) {
        /* calling transfer function from contract */
            tokenInstance.transfer(_address[i], _amount);
            if ((_address[i].balance == 0) && (address(this).balance >= _ethAmount)) {
                require(_address[i].send(_ethAmount));
            }
        }
    }

    /**
     * @dev Airdrop function which take up an array of address, indvidual token amount and eth amount
     * @param _recipients array of address
     * @param _values indvidual token amount
     */
    function sendBatch(address[] _recipients, uint[] _values) public onlyOwner returns (bool) {
        require(_recipients.length == _values.length);
        for (uint i = 0; i < _values.length; i++) {
            tokenInstance.transfer(_recipients[i], _values[i]);
        }
        return true;
    }

    /**
     * @dev Funtion to transfer Ether to owner
     */
    function transferEthToOnwer() public onlyOwner returns (bool) {
        require(owner.send(address(this).balance));
    }

    /**
     * @dev Function to kill contract. 
     */
    function kill() public onlyOwner {
        selfdestruct(owner);
    }
}
