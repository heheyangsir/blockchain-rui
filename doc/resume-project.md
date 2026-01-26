# 项目经历：区块链凭证存储与验证平台

项目名称：区块链凭证存储与验证平台（本地 Hardhat + IPFS）

担任角色：区块链全栈工程师（合约开发 + 前端集成 + 本地部署）

项目概述：
这是一个基于以太坊本地测试链（Hardhat）与 IPFS 的数字凭证存储与验证 DApp，支持用户将 PDF 等凭证文件上载到 IPFS 并将元数据（CID）写入智能合约，实现凭证的不可篡改存证、分级认证、撤销与按交易/地址/名称/文件检索。该项目同时提供前端用户界面（Nuxt3 + Vue3）与本地可复现的开发环境（Hardhat node、Blockscout、本地 IPFS 节点）。

主要职责与实现：

- 智能合约设计与实现
  - 负责 `CredentialRegistry.sol` 的设计与开发，主要功能包括：
    - 存储凭证元数据（CID、名称、发行者、所有者、时间戳）
    - 多级认证：None / PeerCertified / OfficialCertified；支持官方授权实体进行认证
    - 凭证撤销（revoke）与过期标记（expired）
    - 账户名绑定（address <-> name）与基于名字的凭证查询
    - 通过事件（events）记录凭证存储与认证操作，便于前端基于交易日志解析与展示
  - 编写合约时考虑权限控制（管理员 onlyAdmin、authorizedEntities 映射）与边界检查（索引边界、权限校验）

- 本地部署与自动化
  - 使用 Hardhat 管理合约编译与本地网络（31337），并用 Ignition 编写模块化部署配置（`ignition/modules`）以实现可重复的本地部署流程
  - 集成本地 Blockscout 与 IPFS 节点，构建一键启动的开发环境，便于调试与演示

- 前端实现（Nuxt3 / Vue3）
  - 开发上传（`UploadCredential.vue`）、查询（`QueryCredential.vue`）、验证（`VerifyCredential.vue`）与管理（授权、设置账户名）等页面，保证从钱包连接到文件上传到上链的完整用户流程
  - 使用 Viem 构造合约调用（`readContract` / `simulateContract`）并结合 createWalletClient/MetaMask 完成签名与写入（`wallet.client.ts` 中实现自动连接逻辑）
  - 前端通过本地 IPFS HTTP API（localhost:5001）上传文件与 metadata，使用 metadata 的 CID 写入合约
  - 使用 Pinia 管理账户状态（`stores/account.ts`），并将账户信息持久化到 localStorage，处理 accountsChanged 事件以实现断连/重连逻辑

- 测试与质量
  - 在本地 Hardhat 网络上执行功能测试与手工验收（测试代码目录：`test/`，示例存在但需补全更多断言以覆盖边缘场景）
  - 在合约设计时考虑事件与日志便于前端解析，降低前后端联调成本

关键技术栈：
- Solidity、Hardhat、Hardhat Ignition
- Viem、ethers、MetaMask
- Nuxt3、Vue3、Pinia、TailwindCSS、Ant Design Vue
- IPFS（本地节点）、Blockscout（本地链浏览器）
- TypeScript、Vite

成果与可量化描述（示例，请依据实际情况替换数字）：
- 实现端到端凭证上链流程：文件 -> IPFS -> metadata CID -> 智能合约写入
- 缩短凭证核验流程至秒级（原手工核验约需数分钟）
- 构建可复现开发环境，使新成员在 1 小时 内搭建完成并开始调试（相比之前需 1-2 天）
- 编写并维护关键合约与前端交互逻辑，降低前后端联调时间约 30%

面试问答要点（摘录，建议熟悉并能口头陈述）：
- 合约如何保证凭证不可篡改？（CID -> IPFS 内容寻址 + 链上事件/状态记录）
- 如何保护 IPFS 上的隐私或敏感信息？（加密文件后上传 / 仅存储索引/指纹在链上）
- 如何处理链上权限控制？（管理员、authorizedEntities、onlyAdmin modifier）
- 前端如何构造交易并签名？（Viem simulateContract + createWalletClient.writeContract）
- 本地复现环境如何搭建？（Hardhat node + Ignition 部署 + 本地 IPFS + Blockscout）

可直接复制到简历的条目（Markdown 段落，二级标题）：

## 区块链全栈工程师 — 区块链凭证存储与验证平台
- 设计并实现 `CredentialRegistry` 智能合约，支持凭证 CID 上链、分级认证（Peer / Official）、撤销与过期标记，并实现账户名绑定与按交易/地址/名称/文件检索（Solidity）。
- 使用 Hardhat + Ignition 搭建可复现本地部署流程，并集成 Blockscout 与本地 IPFS 节点以便调试与演示。
- 基于 Nuxt3/Vue3 + Pinia 实现上传（文件 -> IPFS -> metadata CID -> 上链）、查询与认证界面；使用 Viem + MetaMask 完成签名与链交互。
- 技术栈：Solidity / Hardhat / Viem / Nuxt3 / Vue3 / Pinia / IPFS / TailwindCSS。

---

 如果你确认内容无误，我可以：
 将该 Markdown 文件 `doc/resume-project.md` 保存到仓库（已完成），或替你同步生成英文版 `doc/resume-project.en.md`；
 根据你给出的实际数字（凭证数、缩短时间等）把“成果与可量化描述”部分替换为真实数据；
 把条目压缩为一行或改写为更偏管理、技术或产品导向的版本。

 请告诉我下一步要做的事情（例如：需要英文版 / 需要替换为真实数字 / 需要特定字数限制等）。