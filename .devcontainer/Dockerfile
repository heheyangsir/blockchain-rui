FROM node:20-bookworm

# 安装系统依赖
RUN apt update && apt install -y \
    curl \
    wget \
    tar \
    bash \
    git \
    python3 \
    make \
    g++ \
    ca-certificates

# 下载并安装 go-ipfs（v0.23.0，amd64架构）3 
RUN cd /tmp && \
    wget https://dist.ipfs.io/go-ipfs/v0.23.0/go-ipfs_v0.23.0_linux-amd64.tar.gz && \
    tar -xvzf go-ipfs_v0.23.0_linux-amd64.tar.gz && \
    cd go-ipfs && \
    bash install.sh && \
    rm -rf /tmp/go-ipfs*

# 初始化 IPFS 存储目录（可选）
RUN ipfs init

# 安装最新 npm + Hardhat + pnpm
RUN npm install -g npm@latest && \
    npm install -g hardhat pnpm

# 暴露 IPFS 相关端口（可选）
EXPOSE 4001 5001 8080

# 默认保持运行（你也可以换成 ipfs daemon）
CMD ["sleep", "infinity"]
