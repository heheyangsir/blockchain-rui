// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialRegistry {

    // 枚举：表示凭证的认证级别
    enum CertificationLevel { 
        None,              // 未认证
        PeerCertified,     // 同行认证
        OfficialCertified  // 官方认证
    }

    // 结构体：凭证的详细信息
    struct Credential {
        string cid;               // 凭证的唯一标识符 (CID)
        string name;              // 凭证的名称
        address issuer;           // 凭证的颁发者地址
        address owner;            // 凭证的拥有者地址
        uint256 timestamp;        // 凭证存储的时间戳
        CertificationLevel certification; // 凭证的认证级别
        address certifiedBy;      // 认证者的地址
        bool revoked;             // 凭证是否被撤销
        bool expired;             // 凭证是否过期
    }

    // 事件：凭证存储时触发
    event CredentialStored(uint256 indexed id, address indexed issuer, address indexed owner, string cid, string name, uint256 timestamp);

    // 事件：凭证认证时触发
    event CredentialCertified(uint256 indexed id, address indexed certifier, CertificationLevel level);

    // 事件：实体授权变更时触发
    event EntityAuthorizationChanged(address indexed entity, bool isAuthorized);

    // 事件：账户名称变更时触发
    event NameChanged(address indexed user, string newName);

    // 事件：凭证过期时触发
    event CredentialExpired(uint256 indexed id, bool expired);

    // 管理员地址
    address private _admin;

    // 存储所有凭证的数组
    Credential[] private _credentials;

    // 授权实体的映射（true表示授权，false表示未授权）
    mapping(address => bool) private _authorizedEntities;

    // 存储每个拥有者与其凭证的映射
    mapping(address => uint256[]) private _ownerToIndexes;

    // 存储每个用户的账户名称
    mapping(address => string) private _names;

    // 存储账户名称与地址的反向映射
    mapping(string => address) private _nameToAddress;

    // 修饰符：仅管理员可以执行
    modifier onlyAdmin() {
        require(msg.sender == _admin, "Only admin can perform this action");
        _;
    }

    // 构造函数：设置管理员为合约部署者
    constructor() {
        _admin = msg.sender;
        _authorizedEntities[_admin] = true;
    }

    // 方法：设置实体是否为授权实体
    function setAuthorizedEntity(address entity, bool isAuthorized) external onlyAdmin {
        _authorizedEntities[entity] = isAuthorized;
        emit EntityAuthorizationChanged(entity, isAuthorized);
    }

    // 方法：检查指定地址是否为授权实体
    function isAuthorized(address entity) external view returns (bool) {
        return _authorizedEntities[entity];
    }

    // 方法：存储新的凭证
    function storeCredential(string memory cid, string memory name, address recipient) external {
        // 确定是否为官方认证
        bool isOfficial = msg.sender == _admin || _authorizedEntities[msg.sender];
        CertificationLevel level = isOfficial ? CertificationLevel.OfficialCertified : CertificationLevel.None;
        address certifier = isOfficial ? msg.sender : address(0);

        // 创建新的凭证
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

        // 存储凭证，并记录凭证的索引
        _credentials.push(newCred);
        uint256 id = _credentials.length - 1;
        _ownerToIndexes[recipient].push(id);

        // 触发凭证存储事件
        emit CredentialStored(id, msg.sender, recipient, cid, name, block.timestamp);

        // 如果是官方认证，触发认证事件
        if (level == CertificationLevel.OfficialCertified) {
            emit CredentialCertified(id, msg.sender, level);
        }
    }

    // 方法：认证指定凭证
    function certifyCredential(uint256 index, CertificationLevel level) external {
        require(index < _credentials.length, "Invalid index");
        require(level != CertificationLevel.None, "Invalid level");

        // 获取指定凭证并认证
        Credential storage cred = _credentials[index];
        if (level == CertificationLevel.OfficialCertified) {
            require(_authorizedEntities[msg.sender], "Not authorized for official certification");
        }

        cred.certification = level;
        cred.certifiedBy = msg.sender;

        // 触发认证事件
        emit CredentialCertified(index, msg.sender, level);
    }

    // 方法：撤销指定凭证
    function revokeCredential(uint256 index) external {
        require(index < _credentials.length, "Invalid index");
        Credential storage cred = _credentials[index];
        require(msg.sender == _admin || msg.sender == cred.issuer, "Not authorized to revoke");
        cred.revoked = true;
    }

    // 方法：设置指定凭证的过期状态
    function setExpired(uint256 index, bool expired) external {
        require(index < _credentials.length, "Invalid index");
        Credential storage cred = _credentials[index];
        require(msg.sender == _admin || msg.sender == cred.issuer, "Not authorized to expire");
        cred.expired = expired;
        emit CredentialExpired(index, expired);
    }

    // 方法：根据所有者地址查询其所有凭证
    function getByOwner(address user) external view returns (Credential[] memory result) {
        uint256[] storage indexes = _ownerToIndexes[user];
        result = new Credential[](indexes.length);
        for (uint256 i = 0; i < indexes.length; i++) {
            result[i] = _credentials[indexes[i]];
        }
    }

    // 方法：根据凭证索引获取凭证
    function getCredential(uint256 index) external view returns (Credential memory) {
        require(index < _credentials.length, "Index out of bounds");
        return _credentials[index];
    }

    // 方法：获取凭证的总数
    function totalCredentials() external view returns (uint256) {
        return _credentials.length;
    }

    // 方法：获取管理员地址
    function getAdmin() external view returns (address) {
        return _admin;
    }

    // 方法：设置用户的账户名称
    function setAccountName(string memory newName) external {
        require(bytes(newName).length > 0, "Name cannot be empty");
        _names[msg.sender] = newName;
        _nameToAddress[newName] = msg.sender;
        emit NameChanged(msg.sender, newName);
    }

    // 方法：根据用户地址获取账户名称
    function getAccountName(address user) external view returns (string memory) {
        return _names[user];
    }

    // 方法：根据账户名称获取用户地址
    function getAddressByName(string memory name) external view returns (address) {
        return _nameToAddress[name];
    }

    // 方法：根据账户名称获取用户的所有凭证
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
