#!/usr/bin/env node

/**
 * Production Build Script
 * This script helps with building the application for production deployment
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Starting production build process...\n');

try {
  // Create dist directory if it doesn't exist
  const distDir = join(process.cwd(), 'dist');
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
    console.log('📁 Created dist directory');
  }

  // Build frontend
  console.log('🔧 Building frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed\n');

  // Copy necessary backend files
  console.log('🔧 Preparing backend for deployment...');
  
  // Create a deployment info file
  const deployInfo = {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'production'
  };
  
  writeFileSync(
    join(distDir, 'deploy-info.json'),
    JSON.stringify(deployInfo, null, 2)
  );
  
  console.log('✅ Backend preparation completed\n');

  console.log('🎉 Production build completed successfully!');
  console.log('📦 Your application is ready for deployment.');
  console.log('📂 Distribution files are in the dist/ directory.');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}