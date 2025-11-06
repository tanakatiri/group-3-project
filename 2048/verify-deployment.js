#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks if the application is ready for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

let errors = 0;
let warnings = 0;

// Check if file exists
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, filePath));
}

// Check required files
function checkRequiredFiles() {
  log.section('📁 Checking Required Files...');
  
  const requiredFiles = [
    'package.json',
    'server.js',
    'config/db.js',
    'public/index.html',
    'public/landlord.html',
    'public/admin.html',
    'public/style.css',
    'public/script.js',
    'public/landlord.js',
    'public/admin.js',
  ];

  requiredFiles.forEach(file => {
    if (fileExists(file)) {
      log.success(`${file} exists`);
    } else {
      log.error(`${file} is missing`);
      errors++;
    }
  });
}

// Check deployment configuration files
function checkDeploymentFiles() {
  log.section('🚀 Checking Deployment Configuration Files...');
  
  const deploymentFiles = [
    { file: 'vercel.json', platform: 'Vercel' },
    { file: 'render.yaml', platform: 'Render' },
    { file: 'railway.json', platform: 'Railway' },
    { file: 'Procfile', platform: 'Heroku' },
    { file: 'Dockerfile', platform: 'Docker' },
    { file: 'docker-compose.yml', platform: 'Docker Compose' },
  ];

  deploymentFiles.forEach(({ file, platform }) => {
    if (fileExists(file)) {
      log.success(`${platform} configuration (${file}) exists`);
    } else {
      log.warning(`${platform} configuration (${file}) is missing`);
      warnings++;
    }
  });
}

// Check documentation
function checkDocumentation() {
  log.section('📚 Checking Documentation...');
  
  const docs = [
    'README.md',
    'DEPLOYMENT.md',
    'QUICK_DEPLOY.md',
    'PRODUCTION_CHECKLIST.md',
    'DEPLOYMENT_SUMMARY.md',
  ];

  docs.forEach(doc => {
    if (fileExists(doc)) {
      log.success(`${doc} exists`);
    } else {
      log.warning(`${doc} is missing`);
      warnings++;
    }
  });
}

// Check package.json
function checkPackageJson() {
  log.section('📦 Checking package.json...');
  
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
    );

    // Check scripts
    if (packageJson.scripts && packageJson.scripts.start) {
      log.success('Start script is defined');
    } else {
      log.error('Start script is missing');
      errors++;
    }

    // Check dependencies
    const requiredDeps = ['express', 'mongoose', 'dotenv', 'cors'];
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        log.success(`Dependency ${dep} is installed`);
      } else {
        log.error(`Dependency ${dep} is missing`);
        errors++;
      }
    });

    // Check type module
    if (packageJson.type === 'module') {
      log.success('ES modules enabled (type: "module")');
    } else {
      log.warning('Not using ES modules');
      warnings++;
    }
  } catch (error) {
    log.error(`Error reading package.json: ${error.message}`);
    errors++;
  }
}

// Check .gitignore
function checkGitignore() {
  log.section('🔒 Checking .gitignore...');
  
  if (fileExists('.gitignore')) {
    const gitignore = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
    
    const requiredEntries = ['node_modules', '.env'];
    requiredEntries.forEach(entry => {
      if (gitignore.includes(entry)) {
        log.success(`${entry} is in .gitignore`);
      } else {
        log.error(`${entry} is missing from .gitignore`);
        errors++;
      }
    });
  } else {
    log.error('.gitignore is missing');
    errors++;
  }
}

// Check environment variables
function checkEnvExample() {
  log.section('🔑 Checking Environment Configuration...');
  
  if (fileExists('.env.example')) {
    log.success('.env.example exists');
    
    const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
    const requiredVars = ['MONGO_URI', 'PORT'];
    
    requiredVars.forEach(varName => {
      if (envExample.includes(varName)) {
        log.success(`${varName} is documented in .env.example`);
      } else {
        log.warning(`${varName} is missing from .env.example`);
        warnings++;
      }
    });
  } else {
    log.warning('.env.example is missing');
    warnings++;
  }

  // Check if .env is gitignored
  if (fileExists('.env')) {
    log.info('.env file exists (should not be committed)');
  }
}

// Check routes
function checkRoutes() {
  log.section('🛣️  Checking API Routes...');
  
  const routes = [
    'routes/houseRoutes.js',
    'routes/inquiryRoutes.js',
    'routes/adminRoutes.js',
  ];

  routes.forEach(route => {
    if (fileExists(route)) {
      log.success(`${route} exists`);
    } else {
      log.warning(`${route} is missing`);
      warnings++;
    }
  });
}

// Check models
function checkModels() {
  log.section('📊 Checking Database Models...');
  
  const models = [
    'models/House.js',
    'models/Inquiry.js',
    'models/Admin.js',
  ];

  models.forEach(model => {
    if (fileExists(model)) {
      log.success(`${model} exists`);
    } else {
      log.warning(`${model} is missing`);
      warnings++;
    }
  });
}

// Check deployment scripts
function checkDeploymentScripts() {
  log.section('🔧 Checking Deployment Scripts...');
  
  const scripts = [
    { file: 'deploy.bat', platform: 'Windows' },
    { file: 'deploy.sh', platform: 'Linux/Mac' },
  ];

  scripts.forEach(({ file, platform }) => {
    if (fileExists(file)) {
      log.success(`${platform} deployment script (${file}) exists`);
    } else {
      log.warning(`${platform} deployment script (${file}) is missing`);
      warnings++;
    }
  });
}

// Main verification
function runVerification() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DEPLOYMENT READINESS VERIFICATION');
  console.log('='.repeat(60));

  checkRequiredFiles();
  checkDeploymentFiles();
  checkDocumentation();
  checkPackageJson();
  checkGitignore();
  checkEnvExample();
  checkRoutes();
  checkModels();
  checkDeploymentScripts();

  // Summary
  log.section('📊 Verification Summary');
  console.log('');
  
  if (errors === 0 && warnings === 0) {
    log.success('All checks passed! Your application is ready for deployment! 🎉');
  } else if (errors === 0) {
    log.warning(`${warnings} warning(s) found. Your application can be deployed, but consider addressing the warnings.`);
  } else {
    log.error(`${errors} error(s) and ${warnings} warning(s) found. Please fix the errors before deploying.`);
  }

  console.log('');
  log.info('Next steps:');
  console.log('  1. Review PRODUCTION_CHECKLIST.md');
  console.log('  2. Setup MongoDB Atlas');
  console.log('  3. Choose a deployment platform (see QUICK_DEPLOY.md)');
  console.log('  4. Set environment variables');
  console.log('  5. Deploy!');
  console.log('');
  console.log('='.repeat(60));
  console.log('');

  process.exit(errors > 0 ? 1 : 0);
}

// Run verification
runVerification();
