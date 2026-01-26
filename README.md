# Hardhat for Rui
# Blockchain Rui — 数字凭证存储与查询 DApp

![Project](https://img.shields.io/badge/project-blockchain--rui-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

这是一个演示性的去中心化应用（DApp），用于存储与查询数字凭证（例如 PDF 凭证）。凭证文件上载到 IPFS，并将元数据/哈希记录到以太坊兼容链（本项目使用 Hardhat 本地链进行开发与测试）。

目录结构（精简）
- `contracts/` — Solidity 智能合约（CredentialRegistry, Lock）
- `frontend/frontendproject/` — Nuxt 3 前端项目（UI + 钱包连接）
- `scripts/`、`ignition/`、`plugins/` — 部署与集成工具

## 核心特性
- 将凭证文件上传到 IPFS，并将对应哈希与元数据写入链上（不可篡改）
- 前端支持钱包连接（MetaMask / WalletConnect），可发起上链事务
- 凭证查询：通过凭证 ID 在合约中检索并展示 IPFS 地址与元数据
- 集成 Blockscout（可选）用于本地链的区块浏览

## 技术栈
- 智能合约：Solidity
- 开发与测试链：Hardhat
- 前端：Nuxt 3（Vue 3） + TailwindCSS
- Web3：viem（前端）
- 文件存储：IPFS

## 快速开始（开发环境）
先确保已安装 Node.js、pnpm（或 npm/yarn）、Git 以及 Docker（如果要运行 Blockscout）。

1. 克隆仓库并安装依赖

```bash
git clone https://github.com/heheyangsir/blockchain-rui.git
cd blockchain-rui
pnpm install
```

2. 编译合约并启动本地 Hardhat 节点

```bash
npx hardhat compile
npx hardhat node
```

3. 在另一个终端运行本地前端（位于 `frontend/frontendproject`）

```bash
cd frontend/frontendproject
pnpm install
pnpm dev
```

4. （可选）启动 Blockscout 本地实例用于查看链上数据

```bash
cd plugins/blockscout/docker-compose
docker-compose -f hardhat-network.yml up -d
```

## 智能合约
- 主要合约：`contracts/CredentialRegistry.sol` — 负责凭证的注册、查询与失效管理
- 辅助合约：`contracts/Lock.sol` — 示例锁合约（来自 Hardhat 示例）

合约构建产物位于 `artifacts/` 与 `ignition/deployments/`（本地部署时会写入）。

## 前端
- 路径：`frontend/frontendproject/`
- 主要页面：
	- `pages/dashboard/UploadCredential.vue` — 上传凭证并发起交易
	- `pages/dashboard/QueryCredential.vue` — 查询并查看凭证
	- `components/WalletConnector.vue` — 钱包连接组件

前端使用 Nuxt 3，开发时运行 `pnpm dev` 即可。前端通过 viem 与智能合约交互。

## 本地测试
智能合约测试（示例）：

```bash
pnpm test
# 或者使用 hardhat 直接运行测试（依赖项目脚本配置）
npx hardhat test
```

## 部署（简介）
本仓库包含用于本地与测试网部署的脚本与配置。一般流程为：

1. 编译合约：`npx hardhat compile`
2. 配置网络与私钥（在环境变量或 hardhat 配置中）
3. 使用部署脚本或脚本目录中的工具完成部署

（注意：部署到公共测试网或主网前请审计合约并保护私钥）

## 演示与截图
（可在此处添加项目截图、演示 GIF 或 GitHub Pages 链接）

## 贡献指南
- Fork 仓库并创建 feature 分支
- 提交清晰的 PR，描述变更与测试步骤
- 对智能合约的改动请附带单元测试

## 许可
本项目默认采用 MIT 许可证（如需更改请在仓库中更新 LICENSE 文件）。

## 联系方式
- 作者：heheyangsir
- 仓库地址：https://github.com/heheyangsir/blockchain-rui

---

如果你想让我帮你再追加：
- 添加项目徽章（CI / coverage / license / release）
- 在 README 中嵌入关键 UI 截图或 GIF
- 根据当前分支添加部署状态或示例链的访问地址

我已将 README 更新为更适合 GitHub 展示的格式。若需要我可以继续把截图/徽章和更多细节补上。


