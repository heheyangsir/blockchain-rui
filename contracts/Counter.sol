// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 private count; // 计数器状态变量

    // 调用时计数器 +1
    function add() public {
        count += 1;
    }

    // 获取当前计数器值
    function get() public view returns (uint256) {
        return count;
    }
}