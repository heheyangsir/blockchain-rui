FROM node:lts-alpine

# 安装基础依赖
RUN apk update && apk add git python3 make g++ bash curl

# 更新 npm 并安装 Hardhat + pnpm
RUN npm install -g npm@latest
RUN npm install -g hardhat pnpm

# Overrides default command so things don't shut down after the process ends.
# command: /bin/sh -c "while sleep 1000; do :; done"
CMD [ "sleep", "infinity" ]