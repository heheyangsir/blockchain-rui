# Hardhat for Rui

## 快速启动

1. Clone this repository and run hardhat node.
```shell
git clone https://github.com/heheyangsir/blockchain-rui
cd blockchain-rui
git submodule update --init --depth=1
pnpm i
npx hardhat compile
npx hardhat node
```

2. Start blockscout
```shell
cd plugins/blockscout/docker-compose
docker-compose -f hardhat-network.yml up -d
```
# **📌 基于区块链的数字凭证存储 DApp**

👋 **团队成员们，欢迎参与本项目！**

## **🌟 项目简介**
本项目是一个基于 **区块链 & IPFS** 的 **数字凭证存储 & 查询 DApp**，
- 允许用户 **上传 PDF 文件**（凭证）并存储到 **IPFS**。
- 使用 **智能合约** 记录凭证信息，保证不可篡改。
- 允许其他用户 **查询凭证** 并在前端展示。

📌 **目标**：实现以账户区分用户，并在链上存储 PDF 文件（凭证），供他人查询与展示。

---

## **🛠 技术栈**
| **组件** | **技术** |
|----------|---------|
| **前端** | React + Vite + TailwindCSS |
| **Web3 交互** | Viem + MetaMask |
| **区块链** | Solidity + Hardhat |
| **存储** | IPFS |
| **区块浏览器** | Blockscout |

---

## **🚀 主要功能**
✅ **凭证存储**：用户上传 PDF → IPFS → 存储哈希到区块链
✅ **凭证查询**：任何用户可输入凭证 ID 并查询 IPFS 地址
✅ **前端交互**：支持 MetaMask 连接 & 交易签名
✅ **智能合约安全**：防止重复存储 & 伪造凭证


## **📌 开发进度 & 计划**
### **✅ 已完成**
- 项目结构搭建
- Hardhat 本地链配置
### **🔄 进行中**
- **编写智能合约**（存储 & 查询凭证）
- **前端 UI 搭建**（Vite + TailwindCSS）
- **IPFS 文件上传测试**
### **🎯 计划任务**
- **前端与智能合约集成**
- **支持用户查询凭证**
- **优化 UI & 交互体验**



## **📌 相关文档**
| **技术** | **文档链接** |
|----------|-------------|
| **Solidity（智能合约语言）** | [https://soliditylang.org/docs/](https://soliditylang.org/docs/) |
| **Hardhat（本地链 & 部署）** | [https://hardhat.org/docs](https://hardhat.org/docs) |
| **Viem（Web3 交互）** | [https://viem.sh](https://viem.sh) |
| **IPFS（文件存储）** | [https://docs.ipfs.io/](https://docs.ipfs.io/) |
| **BlockScout(区块链浏览器)** | [https://docs.blockscout.com/](https://docs.blockscout.com/) |
---


