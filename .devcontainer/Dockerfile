FROM node:lts-alpine

RUN apk update && apk add git python3 make g++ bash curl

RUN npm install -g npm@latest

RUN npm install -g hardhat pnpm

WORKDIR /workspace

EXPOSE 8545 3000

CMD ["sh"]