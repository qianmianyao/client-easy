# ClientEasy

## deploy

Install node and pnpm:

```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.14.0".
nvm current # Should print "v22.14.0".

# Download and install pnpm:
corepack enable pnpm

# Verify pnpm version:
pnpm -v
```

Start the server:

```bash
pnpm install --prod
npx prisma migrate deploy
npx prisma generate
pm2 start ecosystem.config.js --env production
```

Admin Keys:

- xxt-admin0011889
