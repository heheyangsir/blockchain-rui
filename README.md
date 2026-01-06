# Blockchain Rui - 数字凭证存储 DApp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.0-blue)](https://soliditylang.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.x-00DC82)](https://nuxt.com/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.x-yellowgreen)](https://hardhat.org/)

一个基于区块链和 IPFS 的数字凭证存储与查询去中心化应用 (DApp)。允许用户安全地存储凭证文件，并支持其他用户查询和验证凭证的真实性。

## 🌟 功能特性

- **🔐 安全存储**: 使用智能合约在区块链上记录凭证元数据，确保不可篡改
- **📁 文件存储**: 通过 IPFS 分布式存储系统存储实际的凭证文件
- **🔍 便捷查询**: 支持按交易哈希或用户地址查询凭证信息
- **🌐 Web3 集成**: 与 MetaMask 等钱包无缝集成，支持交易签名
- **📱 现代化界面**: 基于 Nuxt 3 和 Ant Design Vue 的响应式前端界面
- **⚡ 实时同步**: 实时显示交易状态和凭证信息

## 🛠 技术栈

| 组件 | 技术 |
|------|------|
| **智能合约** | Solidity ^0.8.0 |
| **开发框架** | Hardhat |
| **前端框架** | Nuxt 3 + Vue 3 |
| **状态管理** | Pinia |
| **UI 组件库** | Ant Design Vue + Nuxt UI |
| **样式** | TailwindCSS |
| **Web3 交互** | Viem |
| **文件存储** | IPFS |
| **区块链浏览器** | Blockscout |

## 📋 前置要求

- Node.js >= 18.0.0
- npm 或 pnpm
- MetaMask 或其他 Web3 钱包
- IPFS 节点 (本地或远程)
- Docker (用于 Blockscout)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/heheyangsir/blockchain-rui.git
cd blockchain-rui
```

### 2. 安装依赖

```bash
# 安装根目录依赖 (Hardhat)
pnpm install

# 安装前端依赖
cd frontend/frontendproject
pnpm install
cd ../..
```

### 3. 启动本地区块链网络

```bash
# 编译智能合约
npx hardhat compile

# 启动 Hardhat 节点
npx hardhat node
```

### 4. 启动 IPFS 节点

确保 IPFS 守护进程在 `http://localhost:5001` 运行：

```bash
ipfs daemon
```

### 5. 启动 Blockscout (可选)

```bash
cd plugins/blockscout/docker-compose
docker-compose -f hardhat-network.yml up -d
```

### 6. 启动前端应用

```bash
cd frontend/frontendproject
pnpm dev
```

访问 `http://localhost:3000` 开始使用应用。

## 📖 使用指南

### 连接钱包

1. 打开应用首页
2. 点击"连接钱包"按钮
3. 在 MetaMask 中批准连接

### 存储凭证

1. 填写凭证名称
2. 输入持有者地址
3. 选择要上传的 PDF 文件
4. 点击"存储凭证"按钮
5. 确认 MetaMask 中的交易

### 查询凭证

- **按交易哈希查询**: 输入存储时的交易哈希
- **按用户查询**: 输入用户地址查看其所有凭证

## 🏗 项目结构

```
blockchain-rui/
├── contracts/              # 智能合约
│   ├── CredentialRegistry.sol
│   └── Lock.sol
├── frontend/
│   └── frontendproject/    # Nuxt 前端应用
│       ├── components/     # Vue 组件
│       ├── pages/          # 页面路由
│       ├── stores/         # Pinia 状态管理
│       └── plugins/        # Nuxt 插件
├── scripts/                # Hardhat 脚本
├── test/                   # 测试文件
├── ignition/               # 部署模块
├── plugins/                # 插件配置
└── abi/                    # 合约 ABI
```

## 🧪 测试

```bash
# 运行智能合约测试
npx hardhat test

# 运行前端测试 (如果有)
cd frontend/frontendproject
pnpm test
```

## 📦 部署

### 智能合约部署

```bash
npx hardhat ignition deploy ignition/modules/CredentialRegistry.ts --network localhost
```

### 前端构建

```bash
cd frontend/frontendproject
pnpm build
```

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者: [heheyangsir](https://github.com/heheyangsir)
- 项目链接: [https://github.com/heheyangsir/blockchain-rui](https://github.com/heheyangsir/blockchain-rui)

## 🙏 致谢

- [Hardhat](https://hardhat.org/) - 以太坊开发环境
- [Nuxt](https://nuxt.com/) - Vue.js 全栈框架
- [IPFS](https://ipfs.io/) - 分布式文件存储
- [Viem](https://viem.sh/) - TypeScript 以太坊库
- [Blockscout](https://blockscout.com/) - 区块链浏览器

---

⭐ 如果这个项目对你有帮助，请给它一个星标！


