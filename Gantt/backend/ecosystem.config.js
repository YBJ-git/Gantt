module.exports = {
  apps: [
    {
      name: 'gantt-workload-api',
      script: 'src/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001
      }
    },
    {
      name: 'gantt-workload-optimization-worker',
      script: 'src/workers/optimizationWorker.js',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env_production: {
        NODE_ENV: 'production',
        WORKER_ID: 'optimization-worker'
      }
    },
    {
      name: 'gantt-workload-notification-service',
      script: 'src/workers/notificationWorker.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        WORKER_ID: 'notification-worker'
      }
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-production-server',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/gantt-workload-system.git',
      path: '/var/www/gantt-workload-api',
      'pre-deploy': 'npm install -g pm2',
      'post-deploy': 
        'npm ci && ' +
        'cp ../.env.production .env && ' +
        'npm run build && ' +
        'npm run db:migrate && ' +
        'pm2 reload ecosystem.config.js --env production && ' +
        'pm2 save',
      'pre-setup': 'echo "Setting up production environment"',
      env: {
        NODE_ENV: 'production'
      }
    },
    staging: {
      user: 'deploy',
      host: 'your-staging-server',
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/gantt-workload-system.git',
      path: '/var/www/staging-gantt-workload-api',
      'pre-deploy': 'npm install -g pm2',
      'post-deploy': 
        'npm ci && ' +
        'cp ../.env.staging .env && ' +
        'npm run build && ' +
        'npm run db:migrate && ' +
        'pm2 reload ecosystem.config.js --env staging && ' +
        'pm2 save',
      'pre-setup': 'echo "Setting up staging environment"',
      env: {
        NODE_ENV: 'staging'
      }
    }
  },
  
  // 로깅 및 모니터링 설정
  log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  error_file: "logs/pm2-error.log",
  out_file: "logs/pm2-out.log",
  merge_logs: true,
  env: {
    NODE_CONFIG_DIR: "./config"
  },
  
  // 모니터링 설정
  monitoring: {
    enable: true,
    alert_threshold: 80, // CPU 사용률 80% 이상 시 알림
    alert_email: "alerts@example.com"
  },
  
  // 백업 설정
  backup: {
    target_dir: "/var/backups/gantt-workload-api",
    // 백업 스크립트 추가
    cron_restart: "0 2 * * *" // 매일 오전 2시에 자동 재시작
  }
};
