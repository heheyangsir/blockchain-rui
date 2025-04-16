// ignition/modules/CredentialRegistry.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CredentialRegistryModule", (m) => {
  const credentialRegistry = m.contract("CredentialRegistry"); // 合约名必须与 Solidity 合约一致
  return { credentialRegistry };
});
