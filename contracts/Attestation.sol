pragma solidity 0.4.19;

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

contract Attestation is Ownable {

    enum Direction {Forwards, Backwards}

    struct UserDetails {
        bool active;
        bytes32 data;
        mapping (address => mapping (bytes32 => Connection)) connections;
    }

    struct CompanyDetails {
        bool active;
        address owner;
        bytes32 data;
    }

    struct Connection {
        bool active;
        bytes32 data;
        uint256 start;
        uint256 end;
        Direction direction;
    }

    mapping (address => UserDetails) public Users;
    mapping (address => CompanyDetails) public Company;

    mapping (address => mapping(address => uint)) CompanyUsers;

    modifier onlyCompanyOwner(address _company_address, address _company_owner) {
        require(CompanyUsers[_company_address][_company_owner] == 1);
        _;
    }

    modifier onlyCompanyUser(address _company_address,address _company_user) {
        require(CompanyUsers[_company_address][_company_user] != 0);
        _;
    }

    modifier companyExist(address _company_address) {
        require(!Company[_company_address].active);
        _;
    }

    function createUserByOwner(address _user_address,bytes32 _data) onlyOwner {
        require(!Users[_user_address].active);
        UserDetails storage userDetails = Users[_user_address];
        userDetails.active = true;
        userDetails.data = _data;
    }

    function createCompanyByOwner(bytes32 _data,address _company_address,address _company_owner) onlyOwner {
        require(!Company[_company_address].active);
        /* create company */
        CompanyDetails storage companyDetails = Company[_company_address];
        companyDetails.active = true;
        companyDetails.owner = _company_owner;
        companyDetails.data = _data;
        /* setting owner */
        CompanyUsers[_company_address][_company_owner] = 1;
    }

    function editCompany(bytes32 _data,address _company_address, address _company_owner) companyExist(_company_address) onlyCompanyOwner(_company_address,_company_owner) {
        CompanyDetails storage companyDetails = Company[_company_address];
        companyDetails.active = true;
        companyDetails.owner = msg.sender;
        companyDetails.data = _data;
    }

    function attestByUserByOwner(address _user_address,address _company_address, bytes32 _connection_type, Direction _direction, uint256 _start, uint256 _end) onlyOwner companyExist(_company_address){
        if(!Users[msg.sender].active)
        {
            createUserByOwner(_user_address,bytes32(0));
        }
        upsertConnection(msg.sender,_company_address,_connection_type,_direction,_start,_end);
    }

    function attestByCompanyByOwner(address _user_address,address _company_address,address _company_user,bytes32 _connection_type, Direction _direction, uint256 _start, uint256 _end) onlyOwner companyExist(_company_address) onlyCompanyUser(_company_address,_company_user) {
        if(!Users[_user_address].active)
        {
            createUserByOwner(_user_address,bytes32(0));
        }
        upsertConnection(_user_address,_company_address,_connection_type,_direction,_start,_end);
    }

    function upsertConnection(address _user_address,address _company_address,bytes32 _connection_type, Direction _direction, uint256 _start, uint256 _end) internal {
        UserDetails storage userDetails = Users[_user_address];
        Connection storage connection = userDetails.connections[_company_address][_connection_type];
        connection.active = true;
        connection.start= _start;
        connection.end= _end;
        connection.direction = _direction;
    }

    function changeCompanyOwnerByOwner(address _company_address,address _company_owner,address _new_owner_address) onlyOwner companyExist(_company_address) onlyCompanyOwner(_company_address,_company_owner) {
        Company[_company_address].owner = _new_owner_address;
        delete CompanyUsers[_company_address][msg.sender];
        CompanyUsers[_company_address][_new_owner_address] = 1;
    }

    function addCompanyUserByOwner(address _company_address,address _company_owner,address _address) onlyOwner companyExist(_company_address) onlyCompanyOwner(_company_address,_company_owner) {
        CompanyUsers[_company_address][_address] = 2;
    }

    function fetchCompany(address _company_address) public returns (bool,address,bytes32) {
        CompanyDetails storage companyDetails = Company[_company_address];
        return (companyDetails.active,companyDetails.owner,companyDetails.data);
    }

    function fetchUser(address _user_address) public returns (bool,bytes32) {
        UserDetails storage userDetails = Users[_user_address];
        return (userDetails.active,userDetails.data);
    }

    function fetchConnectionDetails(address _user_address, address _company_address, bytes32 _connectionType) public returns (bool,bytes32,Direction,uint256,uint256){
        UserDetails storage userDetails = Users[_user_address];
        Connection storage connection = userDetails.connections[_company_address][_connectionType];
        return (connection.active, connection.data, connection.direction, connection.start, connection.end);
    }

}
