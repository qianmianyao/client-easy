module.exports = {
  apps: [
    {
      name: 'client-easy',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXTAUTH_SECRET: 'your-super-secret-key-for-client-easy-app-1234567890',
        DATABASE_URL: 'file:dev.db',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXTAUTH_SECRET: 'your-super-secret-key-for-client-easy-app-1234567890',
        DATABASE_URL: 'file:dev.db',
      },
    },
  ],
}
