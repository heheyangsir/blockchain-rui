# Hardhat for Rui

## Quick start

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
cd blockchain-rui/plugins/blockscout/docker-compose
docker-compose up -f hardhat-network.yml up -d
```
