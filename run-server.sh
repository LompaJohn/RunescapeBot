bun install
( cd ./rs-sdk/server/engine && bun install && bun run start ) &
( cd ./rs-sdk/server/webclient && bun install && bun run watch ) &
( cd ./rs-sdk/server/gateway && bun install && bun run gateway ) &
