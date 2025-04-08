# ClientEasy

## deploy

install bun

```bash
curl -fsSL https://bun.sh/install | bash
```

Install pm2 globally with bun:

```bash
bun install -g pm2
```

```bash
bun install --production
bun prisma generate
pm2 start ecosystem.config.js --env production
```
