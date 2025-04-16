import { createPublicClient, http } from 'viem'
import { hardhat } from 'viem/chains'

async function main() {
  const client = createPublicClient({
    chain: hardhat,
    transport: http('http://localhost:8545'),
  })

  const block = await client.getBlock()
  console.log('当前区块号:', block.number)
  console.log('区块哈希:', block.hash)
  console.log('交易数量:', block.transactions.length)
  console.log('时间戳:', new Date(Number(block.timestamp) * 1000).toLocaleString())
}

main().catch(console.error)
