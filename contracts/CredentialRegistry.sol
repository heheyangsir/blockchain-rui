// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialRegistry {
    enum CertificationLevel { None, PeerCertified, OfficialCertified }

    struct Credential {
        string cid;
        string name;
        address issuer;
        address owner;
        uint256 timestamp;
        CertificationLevel certification;
        address certifiedBy;
        bool revoked;
        bool expired;
    }

    event CredentialStored(uint256 indexed id, address indexed issuer, address indexed owner, string cid, string name, uint256 timestamp);
    event CredentialCertified(uint256 indexed id, address indexed certifier, CertificationLevel level);
    event EntityAuthorizationChanged(address indexed entity, bool isAuthorized);
    event NameChanged(address indexed user, string newName);
    event CredentialExpired(uint256 indexed id, bool expired);

    address private _admin;
    Credential[] private _credentials;

    mapping(address => bool) private _authorizedEntities;
    mapping(address => uint256[]) private _ownerToIndexes;

    mapping(address => string) private _names;
    mapping(string => address) private _nameToAddress;

    modifier onlyAdmin() {
        require(msg.sender == _admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        _admin = msg.sender;
        _authorizedEntities[_admin] = true;
    }

    function setAuthorizedEntity(address entity, bool isAuthorized) external onlyAdmin {
        _authorizedEntities[entity] = isAuthorized;
        emit EntityAuthorizationChanged(entity, isAuthorized);
    }

    function isAuthorized(address entity) external view returns (bool) {
        return _authorizedEntities[entity];
    }

    function storeCredential(string memory cid, string memory name, address recipient) external {
        bool isOfficial = msg.sender == _admin || _authorizedEntities[msg.sender];

        CertificationLevel level = isOfficial ? CertificationLevel.OfficialCertified : CertificationLevel.None;
        address certifier = isOfficial ? msg.sender : address(0);

        Credential memory newCred = Credential({
            cid: cid,
            name: name,
            issuer: msg.sender,
            owner: recipient,
            timestamp: block.timestamp,
            certification: level,
            certifiedBy: certifier,
            revoked: false,
            expired: false
        });

        _credentials.push(newCred);
        uint256 id = _credentials.length - 1;
        _ownerToIndexes[recipient].push(id);

        emit CredentialStored(id, msg.sender, recipient, cid, name, block.timestamp);
        if (level == CertificationLevel.OfficialCertified) {
            emit CredentialCertified(id, msg.sender, level);
        }
    }

    function certifyCredential(uint256 index, CertificationLevel level) external {
        require(index < _credentials.length, "Invalid index");
        require(level != CertificationLevel.None, "Invalid level");

        Credential storage cred = _credentials[index];

        if (level == CertificationLevel.OfficialCertified) {
            require(_authorizedEntities[msg.sender], "Not authorized for official certification");
        }

        cred.certification = level;
        cred.certifiedBy = msg.sender;

        emit CredentialCertified(index, msg.sender, level);
    }

    function revokeCredential(uint256 index) external {
        require(index < _credentials.length, "Invalid index");
        Credential storage cred = _credentials[index];
        require(msg.sender == _admin || msg.sender == cred.issuer, "Not authorized to revoke");
        cred.revoked = true;
    }

    function setExpired(uint256 index, bool expired) external {
        require(index < _credentials.length, "Invalid index");
        Credential storage cred = _credentials[index];
        require(msg.sender == _admin || msg.sender == cred.issuer, "Not authorized to expire");
        cred.expired = expired;
        emit CredentialExpired(index, expired);
    }

    function getByOwner(address user) external view returns (Credential[] memory result) {
        uint256[] storage indexes = _ownerToIndexes[user];
        result = new Credential[](indexes.length);
        for (uint256 i = 0; i < indexes.length; i++) {
            result[i] = _credentials[indexes[i]];
        }
    }

    function getCredential(uint256 index) external view returns (Credential memory) {
        require(index < _credentials.length, "Index out of bounds");
        return _credentials[index];
    }

    function totalCredentials() external view returns (uint256) {
        return _credentials.length;
    }

    function getAdmin() external view returns (address) {
        return _admin;
    }

    function setAccountName(string memory newName) external {
        require(bytes(newName).length > 0, "Name cannot be empty");
        _names[msg.sender] = newName;
        _nameToAddress[newName] = msg.sender;
        emit NameChanged(msg.sender, newName);
    }

    function getAccountName(address user) external view returns (string memory) {
        return _names[user];
    }

    function getAddressByName(string memory name) external view returns (address) {
        return _nameToAddress[name];
    }

    function getByName(string memory name) external view returns (Credential[] memory result) {
        address addr = _nameToAddress[name];
        require(addr != address(0), "Name not bound to any address");
        uint256[] storage indexes = _ownerToIndexes[addr];
        result = new Credential[](indexes.length);
        for (uint256 i = 0; i < indexes.length; i++) {
            result[i] = _credentials[indexes[i]];
        }
    }
}
