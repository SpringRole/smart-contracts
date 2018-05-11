pragma solidity 0.4.19;

contract Attestation {

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

    modifier onlyCompanyOwner(address _company_address) {
        require(CompanyUsers[_company_address][msg.sender] == 1);
        _;
    }

    modifier onlyCompanyUser(address _company_address) {
        require(CompanyUsers[_company_address][msg.sender] != 0);
        _;
    }

    modifier companyExist(address _company_address) {
        require(!Company[_company_address].active);
        _;
    }

    function createUser(address _user_address,bytes32 _data) {
        require(!Users[_user_address].active);
        UserDetails storage userDetails = Users[_user_address];
        userDetails.active = true;
        userDetails.data = _data;
    }

    function createCompany(bytes32 _data,address _company_address) {
        require(!Company[_company_address].active);
        /* create company */
        CompanyDetails storage companyDetails = Company[_company_address];
        companyDetails.active = true;
        companyDetails.owner = msg.sender;
        companyDetails.data = _data;
        /* setting owner */
        CompanyUsers[_company_address][msg.sender] = 1;
    }

    function attestByUser(address _company_address, bytes32 _connection_type, Direction _direction, uint256 _start, uint256 _end) companyExist(_company_address){
        if(!Users[msg.sender].active)
        {
            createUser(msg.sender,bytes32(0));
        }
        upsertConnection(msg.sender,_company_address,_connection_type,_direction,_start,_end);
    }

    function attestByCompany(address _user_address,address _company_address, bytes32 _connection_type, Direction _direction, uint256 _start, uint256 _end) companyExist(_company_address) onlyCompanyUser(_company_address) {
        if(!Users[_user_address].active)
        {
            createUser(_user_address,bytes32(0));
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

    function changeCompanyOwner(address _company_address,address _new_owner_address) companyExist(_company_address) onlyCompanyOwner(_company_address) {
        Company[_company_address].owner = _new_owner_address;
        delete CompanyUsers[_company_address][msg.sender];
        CompanyUsers[_company_address][_new_owner_address] = 1;
    }

    function addCompanyUser(address _company_address,address _address) companyExist(_company_address) onlyCompanyOwner(_company_address) {
        CompanyUsers[_company_address][_address] = 2;
    }

}
