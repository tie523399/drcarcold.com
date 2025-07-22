module.exports = {
  apps: [{
    name: 'drcarcold',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/drcarcold',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/drcarcold-error.log',
    out_file: '/var/log/pm2/drcarcold-out.log',
    log_file: '/var/log/pm2/drcarcold.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: [
      'node_modules',
      '.git',
      'public/uploads',
      'prisma/*.db'
    ],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
} 