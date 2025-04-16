// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title CredentialRegistry
/// @notice 管理凭证的存储、查询与索引功能
contract CredentialRegistry {
    /// @notice 凭证结构体，包含基础元数据
    struct Credential {
        string cid;         // IPFS 上 JSON 文件的 CID
        string name;        // 凭证名称
        address issuer;     // 签发者地址
        address owner;      // 持有者地址
        uint256 timestamp;  // 上链时间戳
    }

    /// @notice 凭证上链事件（便于前端通过交易日志查询）
    event CredentialStored(
        uint256 indexed id,
        address indexed issuer,
        address indexed owner,
        string cid,
        string name,
        uint256 timestamp
    );

    Credential[] public credentials; // 所有凭证的存储数组
    mapping(address => uint256[]) public ownerToIndexes; // 用户地址到其凭证索引的映射

    /// @notice 上链存储凭证
    /// @param cid 指向 IPFS JSON 文件的 CID
    /// @param name 凭证名称
    /// @param owner 凭证的接收者地址
    function storeCredential(
        string memory cid,
        string memory name,
        address owner
    ) external {
        credentials.push(Credential({
            cid: cid,
            name: name,
            issuer: msg.sender,
            owner: owner,
            timestamp: block.timestamp
        }));

        uint256 id = credentials.length - 1;
        ownerToIndexes[owner].push(id);

        emit CredentialStored(id, msg.sender, owner, cid, name, block.timestamp);
    }

    /// @notice 获取指定用户地址下的所有凭证
    /// @param user 用户地址
    /// @return 该用户所有凭证的数组
    function getByOwner(address user) external view returns (Credential[] memory) {
        uint256[] storage indexes = ownerToIndexes[user];
        Credential[] memory result = new Credential[](indexes.length);
        for (uint256 i = 0; i < indexes.length; i++) {
            result[i] = credentials[indexes[i]];
        }
        return result;
    }

    /// @notice 获取单个凭证
    /// @param index 凭证数组中的索引
    function getCredential(uint256 index) external view returns (Credential memory) {
        require(index < credentials.length, "Index out of bounds");
        return credentials[index];
    }

    /// @notice 查询链上凭证总数
    function totalCredentials() external view returns (uint256) {
        return credentials.length;
    }
}
