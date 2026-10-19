module.exports = { apps: [{ name: 'pm-core-api', script: 'server/src/index.js', instances: 1, exec_mode: 'fork', autorestart: true, max_memory_restart: '400M', env: { NODE_ENV: 'production' } }] };
