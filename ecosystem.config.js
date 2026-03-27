const NODE = '/www/server/nvm/versions/node/v24.14.0/bin/node';
const SCRIPT = '/www/wwwroot/sso-api/current/dist/index.js';

module.exports = {
  apps: [
    {
      name: 'sso-medivaq-3005',
      script: SCRIPT,
      interpreter: NODE,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { PORT: 3005 },
    },
    {
      name: 'sso-medivaq-3006',
      script: SCRIPT,
      interpreter: NODE,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { ...commonEnv, PORT: 3006 },
    },
    {
      name: 'sso-medivaq-3007',
      script: SCRIPT,
      interpreter: NODE,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { ...commonEnv, PORT: 3007 },
    },
    {
      name: 'sso-medivaq-3008',
      script: SCRIPT,
      interpreter: NODE,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { ...commonEnv, PORT: 3008 },
    },
    {
      name: 'sso-medivaq-3009',
      script: SCRIPT,
      interpreter: NODE,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { ...commonEnv, PORT: 3009 },
    },
  ],
};
